<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/home" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button mode="ios" color="primary" @click="UpdatePassword()">
                        <ion-icon slot="icon-only" :icon="saveOutline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>
        <ion-content>
            <div class="info">
                <ion-item lines="none">
                    <ion-label position="floating">Name</ion-label>
                    <ion-input type="text" v-model="Name" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Address</ion-label>
                    <ion-input type="text" v-model="Address" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Preparing Time</ion-label>
                    <ion-input type="text" v-model="PreparingTime" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Delivery Type</ion-label>
                    <ion-input type="text" v-model="DeliveryType" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Closing Day</ion-label>
                    <ion-input type="text" v-model="CloseDay" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Opening</ion-label>
                    <ion-input type="text" v-model="Open" readonly></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Tin Number</ion-label>
                    <ion-input type="text" v-model="TinNumber" readonly></ion-input>
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
import { IonContent, IonPage, IonItem, IonInput, IonBackButton, IonLabel, IonIcon } from "@ionic/vue";
import { eyeOutline, eyeOffOutline, saveOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonPage,
        IonContent,
        IonItem,
        IonLabel,
        IonIcon,
        IonInput,
        IonBackButton,
    },
    setup() {
        return {
            eyeOutline,
            eyeOffOutline,
            saveOutline
        }
    },
    data() {
        return {
            EyeIcon: this.eyeOffOutline,
            EyeStatus: false,
            EyePass: "password",
            Name: "",
            Address: "",
            PreparingTime: "",
            DeliveryType: "",
            CloseDay: "",
            Open: "",
            TinNumber: "",
            Password: "",
            StoreID: "",
        }
    },
    created() {
        this.StoreID = (JSON.parse(localStorage.store))[0].id;
    },
    beforeMount() {
        this.LoadUserProfile();
    },
    methods: {
        LoadUserProfile() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_profile", {
                storeid: this.StoreID,
            }).then(res => {
                this.Name = res.data[0].name;
                this.Address = res.data[0].streets;
                this.PreparingTime = res.data[0].preparing_time;
                this.DeliveryType = res.data[0].delivery_type;
                this.CloseDay = res.data[0].close_day;
                this.Open = res.data[0].open_time_a + " - " + res.data[0].open_time_b;
                this.TinNumber = res.data[0].tin;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        UpdatePassword() {
            if (this.Password != "") {
                axios.post(Global.methods.GetURL() + "/store_update_password", {
                    storeid: this.StoreID,
                    password: this.Password,
                }).then(res => {
                    if (res.data == 1) {
                        this.LoadUserProfile();
                    }
                }).catch(err => {
                    console.log(err);
                });
            } else {
                //
            }
        },
        ShowHidePass() {
            if (this.EyeStatus == false) {
                this.EyeStatus = true;
                this.EyeIcon = this.eyeOutline;
                this.EyePass = "text";
            } else {
                this.EyeStatus = false;
                this.EyeIcon = this.eyeOffOutline;
                this.EyePass = "password";
            }
        },
    },
})
</script>

<style lang="scss" scoped>
    .info {
        margin: 15px;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
            margin: 10px 0;
        }
    }
    .eyebtn {
        position: absolute;
        right: 15px;
        top: 17px;
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