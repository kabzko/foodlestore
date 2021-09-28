<template>
    <ion-page>  
        <header class="grid">
            <div class="col-1">
               <ion-buttons>
                    <ion-button @click="CloseModal()">
                        <ion-icon slot="icon-only" :icon="closeOutline" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
            </div>
        </header>

        <ion-content :hidden="Load">
            <ion-card-header>
                <ion-card-title>{{ Product.name }}</ion-card-title>
                <ion-card-subtitle>₱ {{ FormatPrice(Product.price) }}</ion-card-subtitle>
            </ion-card-header>
            <hr v-if="Product.description != null">
            <div class="description" v-if="Product.description != null">
                <span>{{ Product.description }}</span>
            </div>
            <div class="choices" v-if="Choices != null">
                <ion-list v-for="choice of Choices" v-bind:key="choice">
                    <div v-if="choice.mode == 'radio'">
                        <ion-radio-group v-if="choice.status == 'Required'" :id="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()">
                            <ion-list-header>
                                <ion-label>
                                    {{ choice.title }}<small>({{ choice.status }})</small>
                                </ion-label>
                            </ion-list-header>
                            <div>
                                <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                                    <ion-label>
                                        <span>{{ item.name }}</span><br>
                                        <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                                    </ion-label>
                                    <ion-radio v-if="item.checked == 'true'" slot="start" checked color="primary"></ion-radio>
                                    <ion-radio v-else slot="start" :value="item.name" color="primary"></ion-radio>
                                </ion-item>
                            </div>
                        </ion-radio-group>
                        <ion-radio-group v-else :id="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()" allow-empty-selection>
                            <ion-list-header>
                                <ion-label>
                                    {{ choice.title }}<small>({{ choice.status }})</small>
                                </ion-label>
                            </ion-list-header>
                            <div>
                                <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                                    <ion-label>
                                        <span>{{ item.name }}</span><br>
                                        <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                                    </ion-label>
                                    <ion-radio v-if="item.checked == 'true'" slot="start" checked color="primary"></ion-radio>
                                    <ion-radio v-else slot="start" :value="item.name" color="primary"></ion-radio>
                                </ion-item>
                            </div>
                        </ion-radio-group>
                    </div>
                    <div v-else>
                        <ion-list-header>
                            <ion-label>
                                {{ choice.title }}<small>({{ choice.status }})</small>
                            </ion-label>
                        </ion-list-header>
                        <ion-item lines="none" v-for="item of choice.choices" v-bind:key="item">
                            <ion-label>
                                <span>{{ item.name }}</span><br>
                                <small>+ ₱ {{ FormatPrice(item.price) }}</small>
                            </ion-label>
                            <ion-checkbox :checked="item.checked" :class="(choice.title + choice.mode).replace(/\s/g, '').toLowerCase()" slot="start" :value="item.name" color="primary"></ion-checkbox>
                        </ion-item>
                    </div>
                </ion-list>
            </div>
            <div class="addcart">
                <ion-grid>
                    <ion-row>
                        <ion-col>
                            <ion-item lines="none">
                                <ion-input class="ion-text-center" v-model="Quantity"></ion-input>
                            </ion-item>
                        </ion-col>
                        <ion-col>
                            <ion-button mode="ios" expand="full" @click="UpdateOrder()" color="primary">Update</ion-button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonContent, IonPage, IonCardSubtitle, IonIcon, IonCardTitle, IonCardHeader, IonList, IonRadio, IonRadioGroup, IonInput, modalController } from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import Global from "../components/Global";
import axios from "axios";

export default({
    components: {
        IonContent,
        IonPage,
        IonCardSubtitle,
        IonIcon,
        IonCardTitle,
        IonCardHeader,
        IonList,
        IonRadio, 
        IonRadioGroup,
        IonInput
    },
    props: {
        itemid: String
    },
    setup() {
        return {
            closeOutline
        }  
    },
    data() {
        return {
            Product: [],
            Choices: [],
            Quantity: "",
            Load: true
        }
    },
    created() {
        this.LoadProduct();
    },
    methods: {
        FormatPrice(value) {
            const val = (value/1).toFixed(2).replace(",", ".")
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        LoadProduct() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_item_detail", {
                itemid: this.itemid,
            }).then(res => {
                this.Load = false;
                this.Quantity = res.data[0].quantity;
                if (res.data[0].selected_choices != "") {
                    this.Choices = JSON.parse(res.data[0].selected_choices);
                }
                this.Product = res.data[0];
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                Global.methods.Unloading();
            });
        },
        CloseModal() {
            modalController.dismiss();
        },
        UpdateOrder() {
            Global.methods.Loading();
            if (this.Choices.length == 0) {
                axios.post(Global.methods.GetURL() + "/store_item_update", {
                    itemid: this.itemid,
                    choices: "",
                    quantity: this.Quantity
                }).catch(err => {
                    console.log(err);
                }).finally(() => {
                    setTimeout(() => {
                        Global.methods.Unloading();
                        modalController.dismiss({
                            status: "success"
                        });
                    }, 100);
                });
            } else {
                this.Choices.forEach(choiceelement => {
                    if (choiceelement.mode == "radio") {
                        if (document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value == undefined) {
                            choiceelement.choices.forEach(element => {
                                choiceelement.choices.find(x => x.name == element.name).checked = "false";
                            });
                        } else if (document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value != undefined && document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value != "") {
                            choiceelement.choices.find(x => x.name == document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value).checked = "true";
                            choiceelement.choices.forEach(element => {
                                if (element.name != document.getElementById((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase()).value) {
                                    choiceelement.choices.find(x => x.name == element.name).checked = "false";
                                }
                            });
                        } else {
                            // Nothing
                        }
                    } else {
                        const inputElements = document.getElementsByClassName((choiceelement.title + choiceelement.mode).replace(/\s/g, '').toLowerCase());
                        inputElements.forEach(selectedelement => {
                            if (selectedelement.checked) {
                                choiceelement.choices.find(x => x.name == selectedelement.value).checked = "true";
                            } else {
                                choiceelement.choices.find(x => x.name == selectedelement.value).checked = "false";
                            }   
                        });
                    }
                });
                setTimeout(() => {
                    axios.post(Global.methods.GetURL() + "/store_item_update", {
                        itemid: this.itemid,
                        choices: JSON.stringify(this.Choices),
                        quantity: this.Quantity
                    }).catch(err => {
                        console.log(err);
                    }).finally(() => {
                        setTimeout(() => {
                            Global.methods.Unloading();
                            modalController.dismiss({
                                status: "success"
                            });
                        }, 100);
                    });
                }, 500);
            }
        }
    },
})
</script>

<style lang="scss" scoped>
    .addcart {
        margin: 20px 10px;
    }
    .description {
        margin: 20px 15px;
    }
    .description span {
        font-size: 12px;
        color: rgb(110, 110, 110);
    }
    ion-card-subtitle {
        --color: rgb(80, 80, 80);
    }
    ion-list-header {
        padding: 0 !important;
        border-bottom: 1px solid #c8c7cc;
        font-size: 16px !important;
    }
    ion-list-header ion-label {
        margin: 6px 0 !important;
    }
    ion-card-header {
        padding: 16px 11px 0 11px;
    }
    .choices, .instruct {
        margin: 0 12px;
    }
    ion-grid ion-row ion-col {
        display: flex;
        align-items: center;
        ion-item {
            border: 1px solid #c8c7cc;
            border-radius: 10px;
            margin: 10px 0;
            width: 100%;
        }
    }
    ion-grid ion-row ion-col:nth-child(2) {
        ion-button {
            width: 100%;
        }
    }
</style>