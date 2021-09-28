<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/home" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>Orders</ion-title>
            </div>
            <div class="col-3">
            </div>
        </header>
        
        <ion-content>
            <ion-list v-if="PastOrders?.length != 0">
                <ion-list-header>
                    Past orders
                </ion-list-header>
                <ion-card v-for="pastorder of PastOrders" v-bind:key="pastorder" @click.prevent="GotoOrder(pastorder.id)">
                    <ion-grid>
                        <ion-row>
                            <ion-col class="ion-text-right">
                                {{ pastorder.created_at }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                Order ID: {{ pastorder.token }}
                            </ion-col>
                            <ion-col>
                                {{ pastorder.when }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                ₱ {{ FormatPrice(pastorder.price + pastorder.fare) }}
                            </ion-col>
                            <ion-col>
                                {{ pastorder.name }}
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
            </ion-list>
            <div v-if="PastOrders?.length == 0">
                <div class="empty ion-text-center">
                    <img src="../assets/EmptyOrder.png">
                    <div>
                        <h2>You don't have any past orders!</h2>
                    </div>
                    <div>
                        <small>Past orders can be done after the order has been delivered or cancelled.</small>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonTitle, IonBackButton, IonList, IonListHeader } from "@ionic/vue";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent, 
        IonPage, 
        IonTitle, 
        IonBackButton, 
        IonList, 
        IonListHeader
    },
    data() {
        return {
            StoreID: "",
            PastOrders: []
        }
    },
    created() {
        this.StoreID = (JSON.parse(localStorage.store))[0].id;
    },
    beforeMount() {
        this.LoadOrders();
    },
    methods: {
        TimeFormat(time) {
            time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

            if (time.length > 1) {
                const timeparts = time.slice(1);
                const meridiem = timeparts[0] < 12 ? ' AM' : ' PM'
                return ('0' + (timeparts[0] % 12 || 12)).slice(-2) + timeparts[1] + timeparts[2] + meridiem;
            }
        },
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadOrders() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_past_orders", {
                storeid: this.StoreID
            }).then(res => {
                res.data.forEach(x => {
                let total = 0;
                if (x.selected_choices != "") {
                    JSON.parse(x.selected_choices).forEach(y => {
                        y.choices.forEach(z => {
                            if (z.checked == "true") {
                                total += Number(z.price);
                            }
                        });
                    });
                }
                if (this.PastOrders.filter(s => s.id == x.id).length == 0) {
                    this.PastOrders.push({
                        id: x.id,
                        name: x.name,
                        token: x.token,
                        price: (x.price + total) * x.quantity,
                        created_at: x.datetime,
                        fare: x.fare,
                        orderbanner: x.orderbanner,
                        when: typeof x.when.split(", ")[1] === "undefined" ? x.when.split(", ")[0] : x.when.split(", ")[0] + ", " + this.TimeFormat(x.when.split(", ")[1]),
                    });
                } else {
                    this.PastOrders.filter(s => s.id == x.id)[0].price = this.PastOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                }
            });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        GotoOrder(id) {
            this.$router.push({ name: "CompleteOrderDetail", params: { orderid: id } });
        }
    },
})
</script>

<style lang="scss" scoped>
    ion-list-header {
        font-weight: 600;
        font-size: 16px;
    }
    ion-grid {
        ion-row:nth-child(2) {
            ion-col:nth-child(1) {
                font-size: 16px;
                font-weight: 600;
                color: black;
                display: flex;
                align-items: center;
            }
            ion-col:nth-child(2) {
                font-size: 16px;
                font-weight: 600;
                color: red;
                display: flex;
                align-items: center;
                justify-content: flex-end !important;
            }
        }
        ion-row:nth-child(3) {
            ion-col:nth-child(1) {
                font-size: 16px;
                font-weight: 600;
                color: red;
            }
            ion-col:nth-child(2) {
                font-size: 16px;
                font-weight: 600;
                color: var(--ion-color-primary);
                display: flex;
                align-items: center;
                justify-content: flex-end !important;
            }
        }
    }
    .empty {
        width: 75%;
        position: absolute;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
            height: 160px;
        }
    }
</style>