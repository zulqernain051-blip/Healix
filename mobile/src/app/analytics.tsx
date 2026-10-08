import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { apiClient } from '../api/client';
import { WorkflowPage, flowStyles as s } from '../components/common/WorkflowPage';
import { downloadPrivateFile } from '../utils/fileTransfer';
type Report={role:string;period:{from:string;to:string;timezone:string};metrics:{label:string;value:number|null;unit:string}[];tables:{title:string;rows:Record<string,string|number|null>[]}[];limitations:string[]};
export default function Analytics() {
 const [from,setFrom]=useState(''),[to,setTo]=useState(''),[period,setPeriod]=useState(''),[error,setError]=useState(''),[exporting,setExporting]=useState(false);
 const actor=useAuthStore(state=>state.user),admin=actor?.role==='ADMIN';
 const [staffRole,setStaffRole]=useState('NURSE'),[staffPage,setStaffPage]=useState(1),[staffUserId,setStaffUserId]=useState('');
 const staff=useQuery({queryKey:['analytics-staff',actor?.id,staffRole,staffPage],queryFn:()=>apiClient.get<any>(`/admin/users?role=${staffRole}&page=${staffPage}&limit=20`),enabled:admin});
 const records=useQuery({queryKey:['analytics',actor?.id,period],queryFn:()=>apiClient.get<Report>('/analytics/overview'+period)});
 const apply=()=>setPeriod('?'+new URLSearchParams({...from?{from}:{},...to?{to}:{},...(admin && staffUserId?{staffUserId}:{})}).toString());
 const download=async()=>{setExporting(true);setError('');try{await downloadPrivateFile('/analytics/report.csv'+period,'Healix_Report.csv');}catch(e:any){setError(e.message);}finally{setExporting(false);}};
 return <WorkflowPage title="Analytics and reports" loading={records.isLoading} error={error || records.error?.message} retry={()=>void records.refetch()}>
  <Text style={s.body}>Dates and daily grouping use UTC. Choose a period of up to 366 days.</Text>
  <TextInput label="From (YYYY-MM-DD, optional)" value={from} onChangeText={setFrom}/><TextInput label="To (YYYY-MM-DD, optional)" value={to} onChangeText={setTo}/>
  {admin && <View style={s.card}><Text style={s.title}>Staff performance monitoring</Text><Text style={s.body}>Select a nurse or doctor, then apply the period. Clear the selection for platform reports.</Text><View style={s.row}>{['NURSE','DOCTOR'].map(role=><Button key={role} mode={staffRole===role?'contained':'outlined'} onPress={()=>{setStaffRole(role);setStaffPage(1);setStaffUserId('');}}>{role}</Button>)}</View>{staff.error && <Text style={s.body}>{staff.error.message}</Text>}{staff.data?.users.map((user:any)=><Button key={user.id} mode={staffUserId===user.id?'contained':'outlined'} onPress={()=>setStaffUserId(user.id)}>{user.fullName}</Button>)}<View style={s.row}><Button disabled={staffPage===1} onPress={()=>setStaffPage(staffPage-1)}>Previous staff</Button><Text style={s.body}>Staff page {staffPage}</Text><Button disabled={!staff.data || staffPage*20>=staff.data.total} onPress={()=>setStaffPage(staffPage+1)}>Next staff</Button><Button onPress={()=>setStaffUserId('')}>Clear selection</Button></View></View>}
  <View style={s.row}><Button onPress={apply}>Apply period</Button><Button disabled={exporting || !records.data} loading={exporting} onPress={()=>void download()}>Export CSV report</Button></View>
  {records.data && <Text style={s.body}>{records.data.period.from} – {records.data.period.to} · {records.data.role}</Text>}
  {records.data?.metrics.map(item=><View key={item.label} style={s.card}><Text style={s.title}>{item.label}</Text><Text style={s.body}>{item.value==null?'No recorded data':`${item.value} ${item.unit}`}</Text></View>)}
  {records.data?.tables.map(table=><View key={table.title} style={s.card}><Text style={s.title}>{table.title}</Text>{table.rows.length===0?<Text style={s.body}>No recorded data for this period.</Text>:<ScrollView horizontal><View><Text style={s.body}>{Object.keys(table.rows[0]).join(' · ')}</Text>{table.rows.slice(0,100).map((row,index)=><Text key={index} style={s.body}>{Object.values(row).map(value=>value ?? 'No data').join(' · ')}</Text>)}</View></ScrollView>}{table.rows.length>100 && <Text style={s.body}>Showing 100 of {table.rows.length} rows. The CSV includes the complete report.</Text>}</View>)}
  {records.data?.limitations.map(text=><Text key={text} style={s.body}>{text}</Text>)}
 </WorkflowPage>;
}
