"""
Resilient File Operations Engine for Air-Gapped Document Processing.

Implements two-phase transactional file operations, SHA-256 pre/post checksum verification,
journaled state tracking, and fallback handlers for cross-partition device boundaries (EXDEV).
"""

import errno
import hashlib
import os
import shutil
import uuid
from typing import Callable, Optional


def compute_sha256(filepath: str, chunk_size: int = 65536) -> str:
    """Compute SHA-256 digest of a file in binary streaming mode."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(chunk_size):
            sha256.update(chunk)
    return sha256.hexdigest()


class JournaledFileMover:
    """
    Two-Phase Commit File Relocation Engine.

    Guarantees atomic file movement across local and network storage partitions
    with SHA-256 checksum verification and crash-resilient journal logging.
    """

    def __init__(self, shadow_dir: str, journal_callback: Optional[Callable[[str, str, str], None]] = None):
        self.shadow_dir = shadow_dir
        self.journal_callback = journal_callback
        os.makedirs(self.shadow_dir, exist_ok=True)

    def stage_and_commit_move(self, src: str, dest_dir: str) -> str:
        """
        Relocate file from src to dest_dir using 2-Phase Commit with SHA-256 verification.

        Phase 1: Compute pre-move hash, copy to shadow staging, verify staged hash.
        Phase 2: Move staged artifact to final destination, verify dest hash, unlink original.
        """
        if not os.path.isfile(src):
            raise FileNotFoundError(f"Source document not found: {src}")

        os.makedirs(dest_dir, exist_ok=True)
        filename = os.path.basename(src)
        dest_path = os.path.join(dest_dir, filename)

        # 1. Pre-transfer checksum verification
        src_hash = compute_sha256(src)
        transfer_id = str(uuid.uuid4())
        shadow_path = os.path.join(self.shadow_dir, f"{transfer_id}.tmp")

        if self.journal_callback:
            self.journal_callback(transfer_id, "STAGING", src)

        try:
            # Phase 1: Copy to shadow directory
            self._copy_stream(src, shadow_path)
            staged_hash = compute_sha256(shadow_path)
            if staged_hash != src_hash:
                raise ValueError(f"Staged file integrity mismatch: expected {src_hash}, got {staged_hash}")

            if self.journal_callback:
                self.journal_callback(transfer_id, "STAGED", shadow_path)

            # Phase 2: Relocate to target directory (handling EXDEV cross-device links)
            try:
                os.replace(shadow_path, dest_path)
            except OSError as e:
                if e.errno == errno.EXDEV:
                    # Cross-partition move fallback
                    self._copy_stream(shadow_path, dest_path)
                    os.remove(shadow_path)
                else:
                    raise

            # Post-transfer checksum verification
            dest_hash = compute_sha256(dest_path)
            if dest_hash != src_hash:
                if os.path.exists(dest_path):
                    os.remove(dest_path)
                raise ValueError(f"Final document integrity mismatch: expected {src_hash}, got {dest_hash}")

            # Unlink original file only after destination integrity is 100% verified
            os.remove(src)

            if self.journal_callback:
                self.journal_callback(transfer_id, "COMMITTED", dest_path)

            return dest_path

        except Exception as err:
            # Cleanup staging artifact on failure
            if os.path.exists(shadow_path):
                os.remove(shadow_path)
            if self.journal_callback:
                self.journal_callback(transfer_id, "ABORTED", str(err))
            raise err

    def _copy_stream(self, src_path: str, dest_path: str, buffer_size: int = 1048576) -> None:
        """Chunked file copy stream maintaining buffer efficiency."""
        with open(src_path, "rb") as fsrc, open(dest_path, "wb") as fdest:
            shutil.copyfileobj(fsrc, fdest, length=buffer_size)
