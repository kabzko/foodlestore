<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>{{ Token }}</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="callOutline" color="primary"></ion-icon>&nbsp;Customer Information
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Customer Name: {{ Firstname + " " + Lastname }}
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Customer Mobile: {{ PhoneNumber }}
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="timerOutline" color="primary"></ion-icon>&nbsp;Shipping Information
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        {{ When }}
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Delivery Fee: ₱ {{ FormatPrice(Fare) }}
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="bicycle" color="primary"></ion-icon>&nbsp;Rider Information
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Rider ID: {{ RiderCode }}
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Rider Name: {{ RiderName }}
                    </ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>
                        Delivery Status: {{ RiderStatus }}
                    </ion-col>
                </ion-row>
            </ion-grid>
            <ion-grid>
                <ion-row>
                    <ion-col>
                        <ion-icon :icon="receiptOutline" color="primary"></ion-icon>&nbsp;Order Summary
                    </ion-col>
                </ion-row>
                <ion-row v-for="order of Order" v-bind:key="order">
                    <ion-col size="2">
                        {{ order.quantity }}×
                    </ion-col>
                    <ion-col size="7">
                        <span>{{ order.name }}</span><br>
                        <small v-if="order.selected_choices.length != 0">
                            Add-on: 
                            <span v-for="(choice, index) of order.selected_choices" v-bind:key="choice">
                                <span v-if="order.selected_choices.length > 1">
                                    <span v-if="index != (order.selected_choices.length - 1)">{{ choice + ", " }}</span>
                                    <span v-else>{{ " and " + choice + "." }}</span>
                                </span>
                                <span v-else>
                                    <span>{{ choice + "." }}</span>
                                </span>
                            </span>
                        </small>
                        <small v-else>
                            Add-on: None.
                        </small><br>
                        <small>Instruction: 
                            <span v-if="order.instruction != ''">{{ order.instruction }}.</span>
                            <span v-else>None.</span>
                        </small><br>
                        <small>Availabilty: {{ order.availability }}.</small>
                    </ion-col>
                    <ion-col size="3" class="ion-text-end">
                        ₱ {{ FormatPrice(order.price) }}
                    </ion-col>
                    <ion-col size="6" class="ion-text-right" v-if="OrderStatus == 'Pending'">
                        <ion-button mode="ios" expand="full" @click.prevent="UpdateCart(order.item_id)" color="medium">Change</ion-button>
                    </ion-col>
                    <ion-col size="6" class="ion-text-right" v-if="OrderStatus == 'Pending'">
                        <ion-button mode="ios" expand="full" @click.stop="CancelItemAlert(order.item_id)" color="danger">Remove</ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    
        <ion-footer>
            <div class="footer">
                <ion-button v-if="OrderStatus == 'Process' || RiderStatus == 'Accepted'" mode="ios" expand="full" @click="ChangeRider()">Change Rider</ion-button>
                <ion-button v-if="OrderStatus == 'Pending'" mode="ios" expand="full" @click="AcceptOrder()">Accept</ion-button>
                <ion-button v-if="OrderStatus == 'Pending'" mode="ios" expand="full" @click="CancelOrder()">Decline</ion-button>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script>
import { IonContent, IonFooter, IonTitle, IonPage, IonButton, IonBackButton, IonGrid, IonRow, IonCol, IonIcon, alertController, modalController, toastController } from "@ionic/vue";
import { receiptOutline, callOutline, addSharp, bicycle, navigateOutline, timerOutline } from "ionicons/icons";
import { useRoute } from "vue-router";
import CartDetail from "../views/CartDetail";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonFooter,
        IonTitle,
        IonPage,
        IonButton,
        IonBackButton,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon
    },
    setup() {
        const route = useRoute();
        const orderid = route.params.orderid;
        return {
            navigateOutline,
            receiptOutline,
            callOutline,
            addSharp,
            bicycle,
            timerOutline,
            orderid
        }
    },
    data() {
        return {
            Store: (JSON.parse(localStorage.store))[0].id,
            Latitude: (JSON.parse(localStorage.store))[0].latitude,
            Longitude: (JSON.parse(localStorage.store))[0].longitude,
            Order: [],
            Firstname: "",
            Lastname: "",
            PhoneNumber: "",
            Token: "",
            OrderStatus: "",
            RiderName: "N/A",
            RiderStatus: "N/A",
            DeliveryID: "",
            RiderCode: "N/A",
            RiderID: "",
            Fare: 0,
            When: "",
        }
    },
    mounted() {
        this.LoadOrder();
    },
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        LoadOrder() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_order_detail", {
                orderid: this.orderid
            }).then(res => {
                this.Order = [];
                this.Fare = res.data.order[0].fare;
                this.Firstname = res.data.order[0].firstname;
                this.Lastname = res.data.order[0].lastname;
                this.PhoneNumber = res.data.order[0].phone_number;
                this.OrderStatus = res.data.order[0].order_status;
                this.When = res.data.order[0].when;
                if (res.data.rider.length) {
                    this.RiderName = res.data.rider[0].firstname + ' ' + res.data.rider[0].lastname;
                    this.RiderStatus = res.data.rider[0].name;
                    this.DeliveryID = res.data.rider[0].id;
                    this.RiderID = res.data.rider[0].rider_id;
                    this.RiderCode = res.data.rider[0].rider_code;
                }
                res.data.order.forEach(x => {
                    let total = 0;
                    let text = [];
                    if (x.selected_choices != "") {
                        JSON.parse(x.selected_choices).forEach(y => {
                            y.choices.forEach(z => {
                                if (z.checked == "true") {
                                    total += Number(z.price);
                                    text.push(z.name);
                                }
                            });
                        });
                    }
                    this.Order.push({
                        id: x.id,
                        token: x.token,
                        name: x.name,
                        selected_choices: text,
                        price: ((x.price + total) * x.quantity),
                        quantity: x.quantity,
                        created_at: x.datetime,
                        availability: x.availability,
                        instruction: x.instruction,
                        item_id: x.item_id, 
                    });
                });
                // this.LoopReload();
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 250);
            });
        },
        LoopReload() {
            let interval = true;
            setInterval(() => {
                if (interval == true) {
                    interval = false;
                    if (this.OrderStatus == "Process" || this.RiderStatus == "Accepted") {
                        axios.post(Global.methods.GetURL() + "/store_order_detail", {
                            orderid: this.orderid
                        }).then(res => {
                            interval = true;
                            this.Order = [];
                            this.Fare = res.data.order[0].fare;
                            this.Firstname = res.data.order[0].firstname;
                            this.Lastname = res.data.order[0].lastname;
                            this.PhoneNumber = res.data.order[0].phone_number;
                            this.OrderStatus = res.data.order[0].order_status;
                            this.When = res.data.order[0].when;
                            if (res.data.rider.length) {
                                this.RiderName = res.data.rider[0].firstname + ' ' + res.data.rider[0].lastname;
                                this.RiderStatus = res.data.rider[0].name;
                                this.DeliveryID = res.data.rider[0].id;
                                this.RiderID = res.data.rider[0].rider_id;
                                this.RiderCode = res.data.rider[0].rider_code;
                            }
                            res.data.order.forEach(x => {
                                let total = 0;
                                let text = [];
                                if (x.selected_choices != "") {
                                    JSON.parse(x.selected_choices).forEach(y => {
                                        y.choices.forEach(z => {
                                            if (z.checked == "true") {
                                                total += Number(z.price);
                                                text.push(z.name);
                                            }
                                        });
                                    });
                                }
                                this.Order.push({
                                    id: x.id,
                                    token: x.token,
                                    name: x.name,
                                    selected_choices: text,
                                    price: ((x.price + total) * x.quantity),
                                    quantity: x.quantity,
                                    created_at: x.datetime,
                                    availability: x.availability,
                                    instruction: x.instruction,
                                    item_id: x.item_id, 
                                });
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }
            }, 3000);
        },
        async UpdateCart(id) {
            const modal = await modalController.create({
                component: CartDetail,
                cssClass: "my-custom-class",
                componentProps: {
                    itemid: id,
                },
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "success") {
                this.LoadOrder();
            }
        },
        async CancelItemAlert(id) {
            const alert = await alertController.create({
                cssClass: "my-custom-class",
                message: "Did the customer wish to cancel this order item?",
                buttons: [
                    {
                        text: "No",
                        role: "cancel",
                        cssClass: "secondary"
                    },
                    {
                        text: "Yes",
                        handler: () => {
                            this.RemoveItem(id); 
                        },
                    },
                ],
            });
            await alert.present();
        },
        RemoveItem(id) {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_item_remove", {
                cart: this.Order.length,
                orderid: this.orderid,
                itemid: id,
            }).then(res => {
                if (res.data == 1) {
                    this.$router.back();
                }
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                Global.methods.Unloading();
            });
        },
        CancelOrder() {
            axios.get(Global.methods.GetURL() + "/store_order_cancel", {
                orderid: this.orderid
            }).then(res => {
                if (res.data == 1) {
                    setTimeout(() => {
                        localStorage.orders = localStorage.orders - 1;
                        this.LoadOrder();
                    }, 100);
                }
            }).catch(err => {
                console.log(err);
            });
        },
        AcceptOrder() {
            axios.post(Global.methods.GetURL() + "/store_order_accept", {
                storeid: this.Store,
                orderid: this.orderid,
                storelat: this.Latitude,
                storelng: this.Longitude,
            }).then(res => {
                if (res.data == 0) {
                    this.openToast("No riders found near in your area, Please wait and try again later.");
                } else {
                    setTimeout(() => {
                        localStorage.orders = localStorage.orders - 1;
                        this.LoadOrder();
                    }, 100);
                }
            }).catch(err => {
                console.log(err);
            });
        },
        ChangeRider() {
            axios.post(Global.methods.GetURL() + "/store_change_rider", {
                deliveryid: this.DeliveryID,
                storeid: this.Store,
                orderid: this.orderid,
                riderid: this.RiderID,
                storelat: this.Latitude,
                storelng: this.Longitude,
            }).then(res => {
                if (res.data == 0) {
                    setTimeout(() => {
                        this.LoadOrder();
                        this.openToast("No riders found near in your area, Please wait and try again later.");
                    }, 100);
                } else {
                    setTimeout(() => {
                        this.LoadOrder();
                    }, 100);
                }
            }).catch(err => {
                console.log(err);
            }).finally(() => {
               
            });
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
    ion-content ion-grid {
        margin: 10px;
        padding: 5px;
        border: 1px solid rgb(190, 190, 190);
        ion-row:first-child ion-col {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            padding: 0;
            font-size: 16px;
            text-transform: uppercase;
            font-weight: 600;
        }
    }
    ion-footer .footer {
        ion-button {
            margin: 5px;
        }
    }
</style>