import { prisma } from './prisma.ts';

/**
 * Xóa toàn bộ dữ liệu giữa các test.
 * Không xóa bảng migration.
 */
export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.urlTag.deleteMany(),
    prisma.tag.deleteMany(),

    prisma.clickEvent.deleteMany(),
    prisma.dailyStatistic.deleteMany(),
    prisma.browserStatistic.deleteMany(),
    prisma.countryStatistic.deleteMany(),
    prisma.deviceStatistic.deleteMany(),

    prisma.qRCode.deleteMany(), // hoặc qrCode tùy Prisma Client của bạn
    prisma.url.deleteMany(),

    prisma.workspaceInvitation.deleteMany(),
    prisma.workspaceMember.deleteMany(),
    prisma.workspace.deleteMany(),

    prisma.refreshToken.deleteMany(),
    prisma.oAuthAccount.deleteMany(),

    prisma.user.deleteMany(),
  ]);
}