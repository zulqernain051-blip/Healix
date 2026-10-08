import { Text, Button } from 'react-native-paper';
import { View } from 'react-native';
import { useAuthStore } from '../../../store/auth';
import { useFavoriteNurses, useToggleFavoriteNurse } from '../../../hooks/useMarketplace';
import { WorkflowPage, flowStyles as s } from '../../../components/common/WorkflowPage';
import { appAlert } from '../../../components/common/AppDialogs';
export default function FavoriteNurses() {
 const patientId = useAuthStore(state => state.user?.patientId) || '';
 const nurses = useFavoriteNurses(patientId), toggle = useToggleFavoriteNurse(patientId);
 const remove = async(nurseId:string) => { try { await toggle.mutateAsync({nurseId,remove:true}); } catch(e:any) { appAlert('Could not remove favorite',e.message); } };
 return <WorkflowPage title="Favorite nurses">
  <Text style={s.body}>Saved professionals for future offer comparisons.</Text>
  {nurses.isLoading && <Text style={s.body}>Loading saved nurses…</Text>}
  {nurses.isError && <><Text style={s.body}>Could not load favorites.</Text><Button onPress={() => void nurses.refetch()}>Retry</Button></>}
  {nurses.data?.length === 0 && <Text style={s.body}>No saved nurses. Use Save nurse when reviewing an offer.</Text>}
  {nurses.data?.map(item => <View key={item.id} style={s.card}><Text style={s.title}>{item.nurse.user.fullName}</Text><Button disabled={toggle.isPending} onPress={() => void remove(item.nurseId)}>Remove favorite</Button></View>)}
 </WorkflowPage>;
}
