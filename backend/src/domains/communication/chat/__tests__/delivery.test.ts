import { prisma } from '../../../../common/config/database';
import { ChatRepository } from '../chat.repository';

jest.mock('../../../../common/config/database', () => ({ prisma: { chatMessage: { updateMany: jest.fn() } } }));

test('delivery receipts require the specified thread and its recipient', async () => {
  (prisma.chatMessage.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
  expect(await ChatRepository.markMessageDelivered('message-1', 'outsider', 'thread-2')).toBe(false);
  expect(prisma.chatMessage.updateMany).toHaveBeenCalledWith({
    where: { id: 'message-1', threadId: 'thread-2', senderId: { not: 'outsider' }, status: 'SENT',
      thread: { OR: [{ participantAId: 'outsider' }, { participantBId: 'outsider' }] } },
    data: { status: 'DELIVERED' }
  });
});

test('a legitimate delivery receipt succeeds once', async () => {
  (prisma.chatMessage.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
  expect(await ChatRepository.markMessageDelivered('message-1', 'recipient', 'thread-1')).toBe(true);
  expect(await ChatRepository.markMessageDelivered('message-1', 'recipient', 'thread-1')).toBe(false);
});
