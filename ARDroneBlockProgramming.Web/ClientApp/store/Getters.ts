import { IManagerGetters } from './IManagerGetters';
import { ManagerState } from './ManagerState';
import { GetterTree } from 'vuex/types';


const getters: GetterTree<ManagerState, ManagerState> = {
    droneActions: (state: ManagerState, getters: IManagerGetters) => state.droneActions,
    droneSees: (state: ManagerState, getters: IManagerGetters) => state.droneSees,
    droneActionStateCounter: (state: ManagerState, getters: IManagerGetters) => state.droneActionStateCounter,
    droneNavdata: (state: ManagerState, getters: IManagerGetters) => state.droneNavdata
}

export default getters;