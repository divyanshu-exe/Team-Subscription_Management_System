// OWNER: BE-1
// PURPOSE: Authentication business logic (signup, login, reset password, me)

const prisma = require('../../config/db');
const env = require('../../config/env');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signJwt, generateResetToken, hashToken } = require('../../utils/token');
const { sendMail } = require('../../config/mailer');
const { resetPasswordEmail } = require('../../emails/resetPassword');

/**
 * Creates Customer + User(role CUSTOMER) in one transaction
 */
async function signup({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name,
        email: normalizedEmail,
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        customerId: customer.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customerId: true,
      },
    });

    return user;
  });

  const token = signJwt({
    id: result.id,
    email: result.email,
    role: result.role,
    customerId: result.customerId,
  });

  return { token, user: result };
}

/**
 * Validates credentials and returns JWT session
 */
async function login({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is inactive. Please contact support.');
    error.status = 401;
    throw error;
  }

  const token = signJwt({
    id: user.id,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
    },
  };
}

/**
 * Initiates single-use password reset link
 */
async function forgotPassword({ email }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user && user.isActive) {
    // Delete previous unused reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const { raw, hash } = generateResetToken();
    const expiresAt = new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60 * 1000);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt,
      },
    });

    const emailContent = resetPasswordEmail({ name: user.name, token: raw });
    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  // Always respond with the same message
  return {
    message: 'If that email address is in our database, we will send you an email to reset your password.',
  };
}

/**
 * Validates reset token and updates password
 */
async function resetPassword({ token, password }) {
  const hashedToken = hashToken(token);

  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      tokenHash: hashedToken,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetRecord) {
    const error = new Error('Invalid or expired password reset token');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: hashedPassword },
    });

    await tx.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });
  });

  return { message: 'Password has been reset successfully' };
}

/**
 * Returns current authenticated user
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      customerId: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user;
}

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
