import net from 'node:net';
import { OtpDelivery } from '../otp-delivery';
const original = { ...process.env };
afterEach(() => { process.env = { ...original }; });
test('Gmail transport requires credentials and verified TLS', () => {
 delete process.env.SMTP_USER; delete process.env.SMTP_PASS; delete process.env.SMTP_FROM; process.env.SMTP_HOST='smtp.gmail.com';
 expect(() => OtpDelivery.options()).toThrow('Email delivery is not configured');
 process.env.SMTP_USER='sender@gmail.com'; process.env.SMTP_PASS='test app password'; process.env.SMTP_PORT='465';
 expect(OtpDelivery.options().transport).toMatchObject({secure:true,tls:{rejectUnauthorized:true}});
 process.env.SMTP_PORT='587'; expect(OtpDelivery.options().transport.requireTLS).toBe(true);
 process.env.NODE_ENV='production'; process.env.SMTP_HOST='localhost'; delete process.env.SMTP_PASS;
 expect(() => OtpDelivery.options()).toThrow();
});
test('delivers a purpose-specific email through a real local SMTP conversation', async () => {
 let message=''; const sockets = new Set<net.Socket>();
 const server=net.createServer(socket => {
  sockets.add(socket); socket.on('close',()=>sockets.delete(socket)); socket.write('220 localhost test SMTP\r\n');
  let buffer='', data=false;
  socket.on('data', chunk => { buffer+=chunk.toString(); let end:number;
   while((end=buffer.indexOf('\r\n'))>=0) { const line=buffer.slice(0,end); buffer=buffer.slice(end+2);
    if(data) { if(line==='.') {data=false;socket.write('250 accepted\r\n');} else message+=line+'\n'; }
    else if(/^EHLO|^HELO/.test(line)) socket.write('250-localhost\r\n250 SIZE 100000\r\n');
    else if(line==='DATA') {data=true;socket.write('354 send message\r\n');}
    else if(line==='QUIT') socket.end('221 bye\r\n');
    else socket.write('250 ok\r\n');
   }
  });
 });
 await new Promise<void>(resolve => server.listen(0,'127.0.0.1',resolve));
 try { process.env.NODE_ENV='test'; process.env.SMTP_HOST='127.0.0.1'; process.env.SMTP_PORT=String((server.address() as net.AddressInfo).port); process.env.SMTP_FROM='sender@healix-test.invalid';
  await OtpDelivery.send('recipient@healix-test.invalid','123456','PASSWORD_RESET');
  expect(message).toContain('Subject: Reset your Healix password'); expect(message).toContain('123456'); expect(message).toContain('expires in 10 minutes');
 } finally { for(const socket of sockets) socket.destroy(); await new Promise<void>(resolve => server.close(()=>resolve())); }
});
