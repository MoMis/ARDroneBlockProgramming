<template>
    <v-layout row>
        <v-flex xs4 class="actions__wrapper">
            <h1 class="actions-header">Akcje</h1>
            <draggable v-model="droneActions" style="margin-bottom: 50px" :options="actionsContainerOptions"
                class="actions-container" :clone="customClone">
                <action-tile v-for="(element, index) in droneActions"
                    :key="index"
                    :drone-action="element">
                </action-tile>
            </draggable>
        </v-flex>
        <v-flex xs8 class="user-defined-actions__wrapper">
            <h1>Blok instrukcji do wykonania</h1>
            <h3>Początek</h3>
            <draggable v-model="userSelectedActions" :options="{ group: 'drone-actions-group' }" class="user-defined-actions-contaner">
                <action-tile v-for="(element, index) in userSelectedActions"
                    :key="index"
                    :droneAction="element"
                    :index="index"
                    :arrayContaining="userSelectedActions"
                >
                </action-tile>
            </draggable>
            <h3>Koniec</h3>
            <p class="actions-info-text">Umieszczaj akcje powyżej</p>
            <v-btn type="button" @click="sendActions" color="info">Wykonaj akcje</v-btn>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
// @ts-ignore
import draggable from 'vuedraggable';
import { DroneAction } from '../../classes/DroneAction';
import ActionTileComponent from './ActionTile.vue';
import { ActionType } from './../../types/ActionType';
import { AxiosResponse } from 'axios';
import { HubConnection } from '@aspnet/signalr';


@Component({
    components: {
        draggable,
        'action-tile': ActionTileComponent
    }
})
export default class Home extends Vue {
    // @ts-ignore
    @Prop(HubConnection) signalRConnection!: HubConnection;

    actionsContainerOptions = {
        group: {
            name: 'drone-actions-group',
            pull: 'clone',
            put: false
        },
        sort: false
    };

    droneActions: DroneAction[] = [
        new DroneAction('Do góry', ActionType.Up),
        new DroneAction('W dół', ActionType.Down),
        new DroneAction('W lewo', ActionType.Left),
        new DroneAction('W prawo', ActionType.Right),
        new DroneAction('Do przodu', ActionType.Forward),
        new DroneAction('Do tyłu', ActionType.Back),
        new DroneAction('Obracaj w prawo póki nie napotkasz: ', ActionType.TurnRightTillRecognize),
        new DroneAction('Obracaj w lewo póki nie napotkasz: ', ActionType.TurnLeftTillRecognize)
    ];
    userSelectedActions: DroneAction[] = [];

    customClone(originalAction: DroneAction): DroneAction {
        return new DroneAction(originalAction.actionLabel, originalAction.actionType, originalAction.speed, originalAction.duration);
    }

    async sendActions() {
        try {
            this.signalRConnection.invoke("SendActionsToDrone", this.userSelectedActions);
        }
        catch(error) {
            console.log(error);
        }
    }

    async submitForm() {
        try {
            let response = await this.$store.dispatch('sendActionsToAPI', this.userSelectedActions) as AxiosResponse;

            if(response.status == 200) {
                console.log('everything fine');
                console.log(response.data);
            }
        }
        catch(error) {
            console.log(error);
        }
    }
}
</script>

<style scoped>
.actions__wrapper,
.user-defined-actions__wrapper,
.actions-parameters__wrapper {
    margin: 30px;
    background: #ffffff;
    padding: 15px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
}

.actions__wrapper {
    max-height: 710px;
}

.actions-containter {
    width: 100%;
    margin: 5px;
    padding: 5px;
}

.user-defined-actions-contaner {
    min-height: 50px;
    background: #ffffff;
    padding-bottom: 50px;
}

.actions-header{
    margin-bottom: 30px;
}

.actions-info-text {
    text-align: center;
    color: #979797;
    font-size: 15px;
    font-weight: bold;
}
</style>
