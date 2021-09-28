<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="Login()" mode="ios" color="primary">
                        Login
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="info">
                <ion-item lines="none">
                    <ion-label position="floating">Username</ion-label>
                    <ion-input type="text" v-model="Username"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Password</ion-label>
                    <ion-input :type="EyePass" v-model="Password"></ion-input>
                    <ion-button class="eyebtn" @click.self="ShowHidePass()">
                        <ion-icon slot="icon-only" :icon="EyeIcon" color="primary"></ion-icon>
                    </ion-button>
                </ion-item>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonButtons, IonButton, IonItem, IonInput, IonIcon, toastController } from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import Global from '../components/Global';
import axios from 'axios';

export default({
    components: {
        IonContent,
        IonPage,
        IonButton,
        IonButtons,
        IonItem,
        IonInput,
        IonIcon
    },
    setup() {
        return {
            eyeOutline,
            eyeOffOutline
        }
    },
    data() {
        return {
            EyeIcon: this.eyeOffOutline,
            EyeStatus: false,
            EyePass: 'password',
            Username: '',
            Password: ''
        }
    },
    methods: {
        ShowHidePass() {
            if (this.EyeStatus == false) {
                this.EyeStatus = true;
                this.EyeIcon = this.eyeOutline;
                this.EyePass = 'text';
            } else {
                this.EyeStatus = false;
                this.EyeIcon = this.eyeOffOutline;
                this.EyePass = 'password';
            }
        },
        Login() {
            if (this.Username != "") {
                if (this.Password != "") {
                    Global.methods.Loading();
                    axios.post(Global.methods.GetURL() + '/store_login', {
                        username: this.Username,
                        password: this.Password
                    }).then(res => {
                        Global.methods.Unloading();
                        if (res.data != 0) {
                            localStorage.store = JSON.stringify(res.data);
                            this.$router.replace("/");
                        } else {
                            this.openToast("Credentials not found.");
                            this.Password = "";
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                } else {
                    this.openToast("Please fill password field.");
                }
            } else {
                this.openToast("Please fill username field.");
            }
        },
        async openToast(message) {
            const toast = await toastController.create({
                    message: message,
                    mode: "ios",
                    duration: 3000
                });
            return toast.present();
        }
    }
})
</script>

<style lang="scss" scoped>
    .info {
        padding: 16px 16px;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
            margin: 10px 0;
        }
    }
    .eyebtn {
        position: absolute;
        right: 15px;
        top: 15px;
        padding: 0 !important;
        --background: transparent;
        z-index: 2;
        --padding-start: 0;
        --padding-end: 0;
        --padding-top: 0;
        --padding-bottom: 0;
        --box-shadow: 0;
    }
</style>