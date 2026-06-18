import { prisma } from "@/lib/db";
import crypto from "crypto";

export class UnifiedAccountEngine {
  /**
   * Requirement 3: Tiered verification handler (SNA with OTP fallback)
   * Attempts Secure Network Authentication (SNA). If it fails, falls back to OTP.
   */
  async initiateVerification(phoneNumber: string): Promise<{ method: string; verificationId: string; status: string }> {
    // Simulate SNA Verification attempt
    const snaSuccess = Math.random() > 0.5; // Simulate network conditions

    if (snaSuccess) {
      const verification = await prisma.verification.create({
        data: {
          phoneNumber,
          method: "SNA",
          status: "success",
        },
      });
      return { method: "SNA", verificationId: verification.id, status: "success" };
    } else {
      // SNA Failed (e.g., Twilio 60510 mismatch), fallback to OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const verification = await prisma.verification.create({
        data: {
          phoneNumber,
          method: "OTP",
          status: "pending",
          otpCode,
        },
      });
      // In production, trigger SMS delivery here
      return { method: "OTP", verificationId: verification.id, status: "pending_otp" };
    }
  }

  /**
   * Requirement 1: Phone ownership verification bridge using OTP
   * Validates OTP and resolves Link profile conflicts.
   */
  async verifyOTPAndResolveLink(verificationId: string, code: string): Promise<{ success: boolean; accountId?: string }> {
    const verification = await prisma.verification.findUnique({ where: { id: verificationId } });
    
    if (!verification || verification.method !== "OTP" || verification.status !== "pending") {
      throw new Error("Invalid or expired verification session.");
    }

    if (verification.otpCode !== code) {
      return { success: false };
    }

    await prisma.verification.update({
      where: { id: verificationId },
      data: { status: "success" },
    });

    // Check for existing Link profile
    let linkProfile = await prisma.linkProfile.findUnique({
      where: { phoneNumber: verification.phoneNumber },
    });

    if (!linkProfile) {
      linkProfile = await prisma.linkProfile.create({
        data: { phoneNumber: verification.phoneNumber },
      });
    }

    // Resolve conflict by merging or returning associated account
    const existingAccount = await prisma.account.findFirst({
      where: { phoneNumber: verification.phoneNumber },
    });

    if (existingAccount) {
      if (existingAccount.linkProfileId !== linkProfile.id) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { linkProfileId: linkProfile.id },
        });
      }
      return { success: true, accountId: existingAccount.id };
    }

    // Create new unified account
    const newAccount = await prisma.account.create({
      data: {
        phoneNumber: verification.phoneNumber,
        linkProfileId: linkProfile.id,
        accountType: "Standard",
        clinicalData: JSON.stringify({ isolatedSandbox: true }),
      },
    });

    return { success: true, accountId: newAccount.id };
  }

  /**
   * Requirement 2: Automated backend engine to transition account types
   * Transitions from Standard to Express/Custom roles without data loss.
   */
  async transitionAccountType(accountId: string, newType: "Express" | "Custom"): Promise<void> {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new Error("Account not found");

    if (account.accountType === "Standard") {
      await prisma.account.update({
        where: { id: accountId },
        data: { accountType: newType },
      });
    }
  }

  /**
   * Requirement 4: Session linking service to migrate user data and clinical context
   */
  async mergeIdentities(sourceAccountId: string, targetAccountId: string): Promise<void> {
    const sourceAccount = await prisma.account.findUnique({
      where: { id: sourceAccountId },
      include: { sessions: true },
    });
    const targetAccount = await prisma.account.findUnique({ where: { id: targetAccountId } });

    if (!sourceAccount || !targetAccount) throw new Error("Account resolution failed");

    // Migrate clinical data safely (preserve existing target data if any, else move source)
    const mergedClinicalData = targetAccount.clinicalData || sourceAccount.clinicalData;

    // Run transaction to migrate sessions and update target
    await prisma.$transaction(async (tx) => {
      // Move all active sessions to target account
      await tx.session.updateMany({
        where: { accountId: sourceAccountId },
        data: { accountId: targetAccountId },
      });

      // Update clinical context on target
      await tx.account.update({
        where: { id: targetAccountId },
        data: { clinicalData: mergedClinicalData },
      });

      // Deactivate or flag source account as merged
      // For this implementation, we simply clear its sessions and leave it orphaned or delete it
      await tx.account.delete({
        where: { id: sourceAccountId },
      });
    });
  }
}
