const fs = require('fs');
let code = fs.readFileSync('src/domains/communication/chat/chat.service.ts', 'utf8');
code = code.replace(/throw new AppError\(404, 'Thread not found'\);/g, "throw new AppError('Thread not found', 404);");
code = code.replace(/throw new AppError\(403, 'Not a participant of this thread'\);/g, "throw new AppError('Not a participant of this thread', 403);");
code = code.replace(/throw new AppError\(403, 'No valid care request for this thread'\);/g, "throw new AppError('No valid care request for this thread', 403);");
code = code.replace(/throw new AppError\(400, 'Invalid receiver'\);/g, "throw new AppError('Invalid receiver', 400);");
code = code.replace(/throw new AppError\(404, 'Call session not found'\);/g, "throw new AppError('Call session not found', 404);");
code = code.replace(/throw new AppError\(403, 'Unauthorized to update call status'\);/g, "throw new AppError('Unauthorized to update call status', 403);");
fs.writeFileSync('src/domains/communication/chat/chat.service.ts', code);
