import { useAppTheme, usePaperTheme } from '../../theme/ThemeProvider';

import { useEffect, useState } from 'react';
import { AlertButton } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

type Notice = { title: string; message?: string; buttons: AlertButton[] };
let present: ((notice: Notice) => void) | undefined;
export function appAlert(title: string, message?: string, buttons: AlertButton[] = [{text:'OK'}]) {
 if (!present) throw new Error('Application dialogs are not mounted');
 present({title,message,buttons});
}
export const confirmAction = (title: string, message: string) => new Promise<boolean>(resolve => appAlert(title,message,[{text:'Cancel',style:'cancel',onPress:()=>resolve(false)},{text:'Confirm',onPress:()=>resolve(true)}]));
export function AppDialogs() {
  const { colors: COLORS } = useAppTheme();
  const paperTheme = usePaperTheme();

 const [queue,setQueue] = useState<Notice[]>([]);
 useEffect(() => { const handler=(notice:Notice)=>setQueue(q=>[...q,notice]);present=handler;return()=>{if(present===handler)present=undefined;}; },[]);
 const current=queue[0];
 return <Portal><Dialog visible={!!current} dismissable={false} style={{backgroundColor:COLORS.surfaceCard}} theme={paperTheme}><Dialog.Title style={{color:COLORS.textDark}}>{current?.title}</Dialog.Title><Dialog.Content><Text style={{color:COLORS.textBody}}>{current?.message}</Text></Dialog.Content><Dialog.Actions>{current?.buttons.map((button,i)=><Button key={i} textColor={button.style==='destructive'?COLORS.red:COLORS.primaryText} onPress={()=>{setQueue(q=>q.slice(1));button.onPress?.();}}>{button.text || 'OK'}</Button>)}</Dialog.Actions></Dialog></Portal>;
}
