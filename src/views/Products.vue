<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-back-button default-href="/home" color="primary"></ion-back-button>
            </div>
            <div class="col-2">
                <ion-title>Products</ion-title>
            </div>
            <div class="col-3">
                <ion-buttons>
                    <ion-button @click="ShowModalAddProduct()">
                        <ion-icon slot="icon-only" :icon="add" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>
        <ion-content>
            <ion-searchbar placeholder="Search products" v-on:keyup.enter="SearchUsingEnter()" v-model="Search"></ion-searchbar>
            <div class="products-list">
                <ion-card v-for="(product, index) of Products" v-bind:key="product + index" @click.prevent="ShowModalUpdateProduct(product.id)">
                    <div class="ion-text-center">
                        <img :src="product.image" height="120" />
                    </div>
                    <ion-grid>
                        <ion-row>
                            <ion-col size="6">
                                <div>₱ {{ FormatPrice(product.price) }}</div>
                                <div>{{ product.name }}</div>
                            </ion-col>
                            <ion-col size="6">
                                <ion-button class="action-btn" @click.stop="DisableProduct(product.id)" v-if="product.status_id == 1" color="primary">Enabled</ion-button>
                                <ion-button class="action-btn" @click.stop="EnableProduct(product.id)" v-if="product.status_id == 2" color="danger">Disabled</ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-card>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonButtons, IonButton, IonBackButton, IonCard, IonIcon, IonSearchbar, modalController, toastController } from "@ionic/vue";
import { add } from "ionicons/icons"
import Global from "../components/Global";
import axios from "axios";
import NewProduct from "./NewProduct";
import UpdateProduct from "./UpdateProduct";

export default ({
    components: {
        IonPage,
        IonContent,
        IonButtons, 
        IonButton,
        IonBackButton,
        IonCard,
        IonIcon,
        IonSearchbar,
    },
    data() {
        return {
            Products: [],
            StoreID: "",
            Search: "",
        }
    },
    setup() {
        return {
            add
        }
    },
    created() {
        this.StoreID = (JSON.parse(localStorage.store))[0].id;
    },
    beforeMount() {
        this.LoadStoreProducts();
    },
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadStoreProducts() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_products", {
                storeid: this.StoreID,
            }).then(res => {
                this.Products = res.data;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 250);
            });
        },
        async ShowModalAddProduct() {
            const modal = await modalController.create({
                component: NewProduct,
                cssClass: "my-custom-class",
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "success") {
                this.LoadStoreProducts();
            }
        },
        async ShowModalUpdateProduct(id) {
            const modal = await modalController.create({
                component: UpdateProduct,
                cssClass: "my-custom-class",
                componentProps: {
                    productid: id,
                },
            });
            await modal.present();
            const { data } = await modal.onWillDismiss();
            if (data != undefined && data.status == "success") {
                this.LoadStoreProducts();
            }
        },
        SearchUsingEnter() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_search_products", {
                search: this.Search,
                storeid: this.StoreID
            }).then(res => {
                this.Products = [];
                this.Products = res.data;
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 100);
            });
        },
        EnableProduct(id) {
            axios.post(Global.methods.GetURL() + "/store_enable_product", {
                productid: id
            }).then(res => {
                if (res.data == 1) {
                    this.LoadStoreProducts();
                }
            }).catch(err => {
                console.log(err);
            });
        },
        DisableProduct(id) {
            axios.post(Global.methods.GetURL() + "/store_disable_product", {
                productid: id,
                storeid: this.StoreID
            }).then(res => {
                if (res.data == 1) {
                    this.LoadStoreProducts();
                } else {
                    this.openToast("Can't disable product, Requires 1 active products.");
                }
            }).catch(err => {
                console.log(err);
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
    },
})
</script>

<style lang="scss" scoped>
    ion-grid {
        ion-row:nth-child(1) ion-col:nth-child(1) {
            display: inline-block;
            align-items: center;
            justify-content: flex-end !important;
            div:nth-child(1) {
                font-size: 16px;
                color: red;
                font-weight: 600;
            }
            div:nth-child(2) {
                font-size: 18px;
                color: black;
            }
        }
        ion-row:nth-child(1) ion-col:nth-child(2) {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end !important;
        }
    }
    .products-list {
        padding: 10px;
    }
    ion-card-header {
        padding: 10px 16px;
    }
    ion-card-title {
        margin-top: 5px;
    }
    ion-list {
        padding: 0;
    }
    ion-card-header {
        padding-top: 0px;
    }
    .sc-ion-searchbar-md-h {
        margin: 15px 0 0 0 !important;
        padding: 0 10px !important;
    }
    .action-btn {
        width: 150px;
    }
</style>