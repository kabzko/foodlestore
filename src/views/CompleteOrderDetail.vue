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
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonTitle, IonPage, IonBackButton, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import { receiptOutline, callOutline, addSharp, bicycle, timerOutline } from "ionicons/icons";
import { useRoute } from "vue-router";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonTitle,
        IonPage,
        IonBackButton,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon
    },
    mounted() {
        this.LoadOrder();
    },
    setup() {
        const route = useRoute();
        const orderid = route.params.orderid;
        return {
            timerOutline,
            receiptOutline,
            callOutline,
            addSharp,
            bicycle,
            orderid
        }
    },
    data() {
        return {
            Store: (JSON.parse(localStorage.store))[0].id,
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
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        }
    }
})
</script>

<style lang="scss" scoped>
    ion-grid {
        margin: 10px;
        padding: 5px;
        border: 1px solid rgb(190, 190, 190);
        ion-row:first-child ion-col {
            padding: 0;
            font-size: 18px;
            text-transform: uppercase;
            font-weight: 600;
        }
    }
</style>