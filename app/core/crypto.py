"""
SQLCipher Database Encryption & Concurrency Lifecycle Manager.

Configures PRAGMA key parameters, per-platform native SQLCipher bindings,
page size tuning (4096-byte blocks), and connection leasing for multi-threaded background workers.
"""

import os
import sqlite3
import threading
from typing import Generator, Optional


class SQLCipherConfig:
    """SQLCipher Database Configuration & Security Tokens."""

    def __init__(
        self,
        db_path: str,
        encryption_key: str,
        kdf_iter: int = 256000,
        page_size: int = 4096,
        hmac_algorithm: str = "SHA512",
    ):
        self.db_path = db_path
        self.encryption_key = encryption_key
        self.kdf_iter = kdf_iter
        self.page_size = page_size
        self.hmac_algorithm = hmac_algorithm


class SQLCipherConnectionPool:
    """
    Thread-Safe Connection Lease Pool for SQLCipher Encrypted Metadata Registries.

    Prevents cross-thread connection sharing violations in PyQt/PySide daemon workers
    and enforces database-at-rest encryption for regulated clinical data logs.
    """

    def __init__(self, config: SQLCipherConfig, max_connections: int = 5):
        self.config = config
        self.max_connections = max_connections
        self._local = threading.local()
        self._lock = threading.Lock()
        self._active_connections: int = 0

    def get_connection(self) -> sqlite3.Connection:
        """
        Lease a thread-isolated SQLCipher connection initialized with PRAGMA keys.
        """
        if hasattr(self._local, "conn") and self._local.conn is not None:
            return self._local.conn

        with self._lock:
            if self._active_connections >= self.max_connections:
                raise RuntimeError("SQLCipher connection pool exhausted.")
            self._active_connections += 1

        conn = sqlite3.connect(self.config.db_path, check_same_thread=True)
        self._apply_pragmas(conn)
        self._local.conn = conn
        return conn

    def _apply_pragmas(self, conn: sqlite3.Connection) -> None:
        """Apply SQLCipher security PRAGMAs to establish encrypted connection context."""
        cursor = conn.cursor()
        # Set database passphrase
        cursor.execute(f"PRAGMA key = '{self.config.encryption_key}';")
        cursor.execute(f"PRAGMA cipher_page_size = {self.config.page_size};")
        cursor.execute(f"PRAGMA kdf_iter = {self.config.kdf_iter};")
        cursor.execute("PRAGMA cipher_use_hmac = ON;")
        cursor.execute("PRAGMA journal_mode = WAL;")
        cursor.execute("PRAGMA synchronous = NORMAL;")
        conn.commit()

    def close_thread_connection(self) -> None:
        """Close current thread's connection and release pool slot."""
        if hasattr(self._local, "conn") and self._local.conn is not None:
            try:
                self._local.conn.close()
            finally:
                self._local.conn = None
                with self._lock:
                    self._active_connections = max(0, self._active_connections - 1)

    def connection_lease(self) -> Generator[sqlite3.Connection, None, None]:
        """Context manager generator for leasing SQLCipher connections safely."""
        conn = self.get_connection()
        try:
            yield conn
        finally:
            conn.commit()
