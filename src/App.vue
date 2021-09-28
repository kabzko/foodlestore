<template>
    <ion-app>
        <ion-menu content-id="main" type="overlay" swipeGesture="false">
            <ion-content>
                <ion-list>
                    <ion-list-header>{{ Name }}</ion-list-header>
                    <ion-menu-toggle auto-hide="false">
                        <ion-item button lines="none" router-link="/profile">Profile</ion-item>
                    </ion-menu-toggle>
                    <ion-menu-toggle auto-hide="false">
                        <ion-item button lines="none" router-link="/completeorders">Orders</ion-item>
                    </ion-menu-toggle>
                    <ion-menu-toggle auto-hide="false">
                        <ion-item button lines="none" router-link="/products">Products</ion-item>
                    </ion-menu-toggle>
                    <ion-menu-toggle auto-hide="false">
                        <ion-item button lines="none" router-link="/helpcenter">Help Center</ion-item>
                    </ion-menu-toggle>
                    <ion-menu-toggle auto-hide="false" @click="Logout()">
                        <ion-item button lines="none">Log out</ion-item>
                    </ion-menu-toggle>
                </ion-list>
            </ion-content>
        </ion-menu>
        <ion-router-outlet id="main"></ion-router-outlet>
    </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet, IonContent, IonList, IonListHeader, IonMenu, IonMenuToggle, IonItem } from "@ionic/vue";
// import { Plugins } from '@capacitor/core';
import Global from "./components/Global";
import axios from "axios";

// const { LocalNotifications } = Plugins;

export default({
    components: {
        IonApp,
        IonRouterOutlet, 
        IonList,
        IonListHeader ,
        IonItem, 
        IonContent, 
        IonMenu, 
        IonMenuToggle
    },
    data() {
        return {
            StoreID: "",
            Name: "",
        }
    },
    created() {
        // const channel = {
        //     id: 'IncomingOrders',
        //     name: 'Incoming Orders',
        //     importance: 5,
        //     visibility: 1,
        // };
        // LocalNotifications.createChannel(channel);
        if (typeof localStorage.store !== "undefined") {
            this.StoreID = (JSON.parse(localStorage.store))[0].id;
            this.Name = (JSON.parse(localStorage.store))[0].name;
        }
    },
    methods: {
        LoadData() {
            if (typeof localStorage.store !== "undefined") {
                this.StoreID = (JSON.parse(localStorage.store))[0].id;
                this.Name = (JSON.parse(localStorage.store))[0].name;
            }
        },
        Logout() {
           Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_logout", {
                storeid: this.StoreID,
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                localStorage.clear();
                setTimeout(() => {
                    Global.methods.Unloading();
                    this.$router.replace('/login');
                }, 500);
            });
        }
    },
    watch: {
        '$route': 'LoadData'
    }
});
</script>

<style scoped>
    ion-list {
        padding: 20px 10px;
    }
    ion-list-header {
        font-size: 18px;
        font-weight: 600;
        color: var(--ion-color-primary);
    }
</style>