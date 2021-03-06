import { HubConnectionBuilder, HubConnection } from '@aspnet/signalr';
import { DroneAction } from './classes/droneAction';
import { DroneOperator } from './droneOperator';

(<any>global).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
(<any>global).WebSocket = require("websocket").w3cwebsocket;


export class SignalRService {
    private _connection: HubConnection;
    private _droneOperator: DroneOperator;

    public async initSignalR() {
        this._connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5026/droneHub")
            .build();

        try {
            await this._connection.start();
            this.initConnections();
            
            this._droneOperator = new DroneOperator(this._connection);
            // this.initDroneSendingPosition();
            await this._connection.invoke('SendRestrictedModeConfirmation', this._droneOperator.getRestrictionsMeters());

            console.log('Connection started');
        }
        catch(error) {
            console.error(error);
        }
    }

    public async initConnections() {
        this._connection.on('PerformActions', async (data: DroneAction[]) => {
            console.log('PerformActions');
            console.log(data);

            var result = await this._droneOperator.runActions(data);
            console.log('finished on drone');
            if(result) {
                this._connection.invoke('DroneFinishedPerformingActions');
            }
            else {
                this._connection.invoke('DroneFinishedPerformingActionsWithErrors');
            }
        });

        this._connection.on('DisableDroneMotors', () => {
            this._droneOperator.disableDroneMotors();
        });

        this._connection.on('ResetDroneStopState', () => {
            this._droneOperator.emergencyStopReset();
        });

        this._connection.on('StopAndLand', () => {
            this._droneOperator.forceLand();
        });

        this._connection.on('SetRestrictedModeDistance', async (restrictedArea) => {
            this._droneOperator.setRestrictedAreaInMeters(restrictedArea);
            await this._connection.invoke('SendRestrictedModeConfirmation', this._droneOperator.getRestrictionsMeters());
        });
    }

    public async initDroneTagsRecognizingInterval() {
        setInterval(async () => {
            let tags = await this._droneOperator.getTagsInDroneRange();
            this._connection.invoke('TagsRecognizedByDrone', tags);
        }, 2000);
    }

    public async initDroneSendingPosition() {
        setInterval(async () => {
            let position = await this._droneOperator.getPosition();
            if(position == null) {
                console.log('null in initDroneSendingPosition');
            }
            let stringifiedData = JSON.stringify(position);
            
            await this._connection.invoke('PositionFromDrone', stringifiedData);
        }, 1000);
    }
}