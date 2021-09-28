<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-menu-button autoHide="false" color="primary"></ion-menu-button>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
            </div>
        </header>
        
        <ion-content>
            <ion-segment v-model="Segment">
                <ion-segment-button value="New">
                    New({{ NewOrders.length }})
                </ion-segment-button>
                <ion-segment-button value="Active">
                    Active({{ ActiveOrders.length }})
                </ion-segment-button>
            </ion-segment>
            <div v-if="Segment == 'New'">
                <ion-card v-for="neworder of NewOrders" v-bind:key="neworder" @click="NavigateToOrder(neworder.id)">
                    <ion-grid>
                        <ion-row>
                            <ion-col class="ion-text-right">
                                {{ neworder.created_at }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                Order ID: {{ neworder.token }}
                            </ion-col>
                            <ion-col>
                                {{ neworder.when }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                ₱ {{ FormatPrice(neworder.price + neworder.fare) }}
                            </ion-col>
                            <ion-col>
                                {{ neworder.name }}
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
                <div v-if="NewOrders?.length == 0">
                    <div class="empty ion-text-center">
                        <img src="../assets/EmptyOrder.png">
                        <div>
                            <h2>No new orders found!</h2>
                        </div>
                        <div>
                            <small>Be patience, browsing delicious food can be hard.</small>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="Segment == 'Active'">
                <ion-card v-for="activeorder of ActiveOrders" v-bind:key="activeorder" @click="NavigateToOrder(activeorder.id)">
                    <ion-grid>
                        <ion-row>
                            <ion-col class="ion-text-right">
                                {{ activeorder.created_at }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                Order ID: {{ activeorder.token }}
                            </ion-col>
                            <ion-col>
                                {{ activeorder.when }}
                            </ion-col>
                        </ion-row>
                        <ion-row>
                            <ion-col>
                                ₱ {{ FormatPrice(activeorder.price + activeorder.fare) }}
                            </ion-col>
                            <ion-col>
                                {{ activeorder.name }}
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
                <div v-if="ActiveOrders?.length == 0">
                    <div class="empty ion-text-center">
                        <img src="../assets/EmptyOrder.png">
                        <div>
                            <h2>No active orders yet!</h2>
                        </div>
                        <div>
                            <small>Think thoroughly before deciding, You might made a mistake if you lose focus.</small>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonMenuButton, IonSegment, IonSegmentButton } from "@ionic/vue";
import { LocalNotifications } from "@ionic-native/local-notifications";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonMenuButton,
        IonSegment,
        IonSegmentButton,
    },
    data() {
        return {
            NewOrders: [],
            ActiveOrders: [],
            Segment: "New",
            StoreID: "",
        }
    },
    created() {
        this.StoreID = (JSON.parse(localStorage.store))[0].id;
    },
    beforeMount() {
        this.LoadHome();
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
        LoadHome() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_active_orders", {
                storeid: this.StoreID
            }).then(res => {
                localStorage.orders = res.data.new.length;
                res.data.new.forEach(x => {
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
                    if (this.NewOrders.filter(s => s.id == x.id).length == 0) {
                        this.NewOrders.push({
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
                        this.NewOrders.filter(s => s.id == x.id)[0].price = this.NewOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
                res.data.active.forEach(x => {
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
                    if (this.ActiveOrders.filter(s => s.id == x.id).length == 0) {
                        this.ActiveOrders.push({
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
                        this.ActiveOrders.filter(s => s.id == x.id)[0].price = this.ActiveOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                    }
                });
                this.LoopReload();
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
                    axios.post(Global.methods.GetURL() + "/store_active_orders", {
                        storeid: this.StoreID
                    }).then(res => {
                        interval = true;
                        this.NewOrders = [];
                        this.ActiveOrders = [];
                        if (res.data.new.length != 0) {
                            if (res.data.new.length != localStorage.orders) {
                                LocalNotifications.schedule({
                                    id: 1,
                                    title: "You have new orders",
                                    text: "Check it out now...",
                                    channel: "IncomingOrders",
                                });
                            }
                        }
                        localStorage.orders = res.data.new.length;
                        res.data.new.forEach(x => {
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
                            if (this.NewOrders.filter(s => s.id == x.id).length == 0) {
                                this.NewOrders.push({
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
                                this.NewOrders.filter(s => s.id == x.id)[0].price = this.NewOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                            }
                        });
                        res.data.active.forEach(x => {
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
                            if (this.ActiveOrders.filter(s => s.id == x.id).length == 0) {
                                this.ActiveOrders.push({
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
                                this.ActiveOrders.filter(s => s.id == x.id)[0].price = this.ActiveOrders.filter(s => s.id == x.id)[0].price + ((x.price + total) * x.quantity);
                            }
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }, 3000);
        },
        NavigateToOrder(id) {
            this.$router.push({ name: "Order", params: { orderid: id } });
        }
    },
});
</script>

<style lang="scss" scoped>
    ion-card {
        margin: 10px 10px 10px 10px;
        img {
            display: block;
        }
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