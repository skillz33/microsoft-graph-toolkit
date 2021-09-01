import { IGraph } from '@microsoft/mgt-element';
import { Channel } from '@microsoft/microsoft-graph-types';
import { getAllMyTeams } from '../../components/mgt-teams-channel-picker/mgt-teams-channel-picker.graph';

export async function findChannels(graph: IGraph, filter?: string): Promise<Channel[]> {
  const allMyTeams = await getAllMyTeams(graph);
  const myTeams = allMyTeams.filter(team => !team.isArchived);
  const allMyChannels = await Promise.all(
    myTeams.map(team => {
      const request = graph.api(`/teams/${team.id}/channels`);
      if (filter) {
        request.filter(`contains(displayName,'${filter}')`);
      }
      return request.get();
    })
  );
  const myChannels = [];
  allMyChannels.forEach(channel => {
    myChannels.push(...channel.value);
  });
  return myChannels;
}
