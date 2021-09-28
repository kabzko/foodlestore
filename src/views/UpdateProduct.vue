<template>
    <ion-page>
        <header class="grid">
            <div class="col-1">
                <ion-buttons @click="CloseModal()">
                    <ion-button>
                        <ion-icon slot="icon-only" :icon="close" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
            <div class="col-2">
            </div>
            <div class="col-3">
                <ion-buttons @click="UpdateProduct()">
                    <ion-button>
                        <ion-icon slot="icon-only" :icon="cloudUploadOutline" color="primary"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </div>
        </header>

        <ion-content>
            <div class="container">
                <div class="avatar-upload">
                    <div class="avatar-edit">
                        <input type="file" id="inputImage" accept="image/*" @change="readURL" />
                        <label for="inputImage">
                            <div class="text-center mt-1">
                                <ion-icon style="font-size: 32px;" slot="icon-only" :icon="pencilSharp" color="primary"></ion-icon>
                            </div>
                        </label>
                    </div>
                    <div class="avatar-preview">
                        <div id="imagePreview">
                        </div>
                    </div>
                </div>
                <ion-item lines="none">
                    <ion-label position="floating">Name</ion-label>
                    <ion-input type="text" v-model="Name"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Price</ion-label>
                    <ion-input type="number" step="any" v-model="Price"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Description</ion-label>
                    <ion-input type="text" v-model="Description"></ion-input>
                </ion-item>
                <ion-item lines="none">
                    <ion-label position="floating">Category</ion-label>
                    <ion-select v-model="Category">
                        <ion-select-option v-for="(cat, index) of Categories" :key="cat + index" :value="cat.category">{{ cat.category }}</ion-select-option>
                        <ion-select-option value="Create new">Create new</ion-select-option>
                    </ion-select>
                </ion-item>
                <ion-item v-if="CreateNew == 1" lines="none">
                    <ion-label position="floating">New Category</ion-label>
                    <ion-input type="text" v-model="NewCategory"></ion-input>
                </ion-item>
                <ion-grid class="border">
                    <ion-row>
                        <ion-col class="ion-text-center">
                            <ion-button @click="AddOfferSlot()">Add offers</ion-button>
                        </ion-col>
                    </ion-row>
                    <ion-row class="offer-top" v-for="(offer, offerindex) of Offers" :key="offer + offerindex">
                        <ion-col>
                            <ion-row>
                                <ion-col class="offer-title">
                                    <span>Offer {{ offerindex + 1}}</span>
                                </ion-col>
                                <ion-col class="ion-text-right">
                                    <ion-button @click="RemoveOfferSlot(offerindex)">
                                        Remove
                                    </ion-button>
                                </ion-col>
                            </ion-row>
                            <ion-item lines="none">
                                <ion-label position="floating">Title</ion-label>
                                <ion-input type="text" v-model="offer.title"></ion-input>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-label position="floating">Mode</ion-label>
                                <ion-select v-model="offer.mode">
                                    <ion-select-option value="checkbox" selected>Checkbox</ion-select-option>
                                    <ion-select-option value="radio">Radio</ion-select-option>
                                </ion-select>
                            </ion-item>
                            <ion-item lines="none">
                                <ion-label position="floating">Status</ion-label>
                                <ion-select name="" id="" v-model="offer.status">
                                    <ion-select-option value="optional">Optional</ion-select-option>
                                    <ion-select-option value="required">Required</ion-select-option>
                                </ion-select>
                            </ion-item>
                            <ion-grid class="border">
                                <ion-row>
                                    <ion-col class="ion-text-center">
                                        <ion-button @click="AddChoiceSlot(offerindex)">More choices</ion-button>
                                    </ion-col>
                                </ion-row>
                                <ion-row class="border">
                                    <ion-col size="6" class="choice" v-for="(choice, choiceindex) of Offers[offerindex].choices" :key="choice + choiceindex">
                                        <ion-item lines="none">
                                            <ion-label position="floating">Name</ion-label>
                                            <ion-input type="text" v-model="choice.name"></ion-input>
                                        </ion-item>
                                        <ion-item lines="none">
                                            <ion-label position="floating">Price</ion-label>
                                            <ion-input type="number" step="any" v-model="choice.price"></ion-input>
                                        </ion-item>
                                        <ion-item lines="none">
                                            <ion-label position="floating">Selected</ion-label>
                                            <ion-select v-model="choice.checked">
                                                <ion-select-option value="true">true</ion-select-option>
                                                <ion-select-option value="false">false</ion-select-option>
                                            </ion-select>
                                        </ion-item>
                                        <div class="ion-text-center">
                                            <ion-button :disabled="Offers[offerindex].choices.length <= 1" @click="RemoveChoiceSlot(offerindex, choiceindex)">
                                                Remove
                                            </ion-button>
                                        </div>
                                    </ion-col>
                                </ion-row>
                            </ion-grid>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </div>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonContent, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, modalController, toastController } from "@ionic/vue";
import { close, pencilSharp, cloudUploadOutline } from "ionicons/icons"
import Global from "../components/Global";
import axios from "axios";

export default ({
    components: {
        IonPage,
        IonContent,
        IonButtons, 
        IonButton,
        IonIcon,
        IonItem, 
        IonLabel, 
        IonInput, 
        IonSelect, 
        IonSelectOption, 
        IonGrid, 
        IonRow, 
        IonCol,
    },
    props: {
        productid: String,
    },
    data() {
        return {
            Categories: [],
            Offers: [],
            CreateNew: 0,
            Name: "",
            Price: "",
            Description: "",
            Category: "",
            NewCategory: "",
            Image: "",
            StoreID: "",
        }
    },
    setup() {
        return {
            close,
            pencilSharp,
            cloudUploadOutline
        }
    },
    created() {
        this.StoreID = (JSON.parse(localStorage.store))[0].id;
    },
    mounted() {
        this.LoadStoreCategory();
    },
    methods: {
        LoadStoreCategory() {
            Global.methods.Loading();
            axios.post(Global.methods.GetURL() + "/store_product_detail", {
                storeid: this.StoreID,
                productid: this.productid,
            }).then(res => {
                document.getElementById("imagePreview").style.backgroundImage = "url(" + res.data.product[0].image.replace(/ /g, '%20') + ")";
                this.Categories = res.data.category;
                if (res.data.product[0].choices != "") {
                    this.Offers = JSON.parse(res.data.product[0].choices);
                }
                this.Name = res.data.product[0].name;
                this.Price = res.data.product[0].price;
                this.Description = res.data.product[0].description;
                setTimeout(() => {
                    this.Category = res.data.product[0].category;
                }, 100);
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                setTimeout(() => {
                    Global.methods.Unloading();
                }, 250);
            });
        },
        readURL(input) {
            if (input.target.files && input.target.files[0]) {
                let reader = new FileReader();
                reader.readAsDataURL(input.target.files[0]);
                reader.onload = input => {
                    const image = new Image();
                    image.src = input.target.result;
                    image.onload = res => {
                        if (res.path[0].height == 1053 && res.path[0].width == 1440) {
                            this.Image = document.getElementById("inputImage").files[0];
                            document.getElementById("imagePreview").style.backgroundImage = "url(" + input.target.result + ")";
                        } else {
                            this.openToast("Upload image height and width must be 1053px and 1440px.");
                        }
                    };
                }             
            }
        },
        AddOfferSlot() {
            this.Offers.push({
                title: "",
                mode: "",
                status: "",
                choices: [
                    {
                        name: "",
                        price: "",
                        checked: "false",
                    }
                ]
            });
        },
        AddChoiceSlot(index) {
            this.Offers[index].choices.push({
                name: "",
                price: "",
                checked: "false",
            });
        },
        RemoveOfferSlot(index) {
            this.Offers.splice(index, 1);
        },
        RemoveChoiceSlot(offerindex, choiceindex) {
            if (this.Offers[offerindex].choices.length > 1) {
                this.Offers[offerindex].choices.splice(choiceindex, 1);
            } else {
                alert("Can't remove more");
            }
        },
        UpdateProduct() {
            let category;
            let checker = 0;
            if (this.Image == "") {
                this.Image = null;
            }
            if (this.Name != "") {
                if (this.Price != "") {
                    if (this.CreateNew == 1) {
                        category = this.NewCategory;
                    } else {
                        category = this.Category
                    }
                    if (category != "") {
                        if (this.Offers.length != 0) {
                            this.Offers.forEach((x, index) => {
                                if (x.title == "" || x.mode == "" || x.status == "") {
                                    this.openToast("Some offers fields are empty.");
                                    checker = 1;
                                } else {
                                    x.choices.forEach(z => {
                                        if (z.name == "" || z.price == "" || z.checked == "") {
                                            this.openToast("Some choices fields are empty.");
                                            checker = 1;
                                        }
                                    });
                                }
                                if (this.Offers.length == (index + 1) && checker == 0) {
                                    const Data = new FormData();
                                    Data.append("name", this.Name);
                                    Data.append("price", this.Price);
                                    Data.append("description", this.Description);
                                    Data.append("choices", JSON.stringify(this.Offers));
                                    Data.append("category", category);
                                    Data.append("image", this.Image);
                                    Data.append("storeid", this.StoreID);
                                    Data.append("productid", this.productid);
                                    axios.post(Global.methods.GetURL() + "/store_update_product", Data).then(res => {
                                        if (res.data == 1) {
                                            this.Name = "";
                                            this.Price = "";
                                            this.Description = "";
                                            this.Offers = [];
                                            this.Category = "";
                                            this.NewCategory = "";
                                            modalController.dismiss({
                                                status: "success",
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            const Data = new FormData();
                            Data.append("name", this.Name);
                            Data.append("price", this.Price);
                            Data.append("description", this.Description);
                            Data.append("choices", "");
                            Data.append("category", category);
                            Data.append("image", this.Image);
                            Data.append("storeid", this.StoreID);
                            Data.append("productid", this.productid);
                            axios.post(Global.methods.GetURL() + "/store_update_product", Data).then(res => {
                                if (res.data == 1) {
                                    this.Name = "";
                                    this.Price = "";
                                    this.Description = "";
                                    this.Category = "";
                                    this.NewCategory = "";
                                    modalController.dismiss({
                                        status: "success",
                                    });
                                }
                            });
                        }
                    } else {
                        this.openToast("Product category field is empty.");
                    }
                } else {
                    this.openToast("Product price field is empty.");
                }
            } else {
                this.openToast("Product name field is empty.");
            }
        },
        CloseModal() {
            modalController.dismiss();
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
    watch: {
        Category() {
            if (this.Category === "Create new") {
                this.CreateNew = 1;
            } else {
                this.CreateNew = 0;
            }
        }
    }
})
</script>

<style lang="scss" scoped>
    .container {
        padding: 16px 16px;
    }
    ion-item {
        border: 1px solid #c8c7cc;
        border-radius: 10px;
        margin: 10px 0;
    }
    ion-col {
        padding: 0;
    }
    .choice {
        padding: 0 5px;
    }
    .offer-top {
        border: 1px solid gray;
        padding: 5px;
        margin: 5px 0;
    }
    .offer-title {
        display: flex;
        align-items: center;
        span {
            font-size: 22px;
            font-weight: 600;
        }
    }
        .avatar-upload {
        position: relative;
        max-width: 205px;
        margin: 10px auto;
    }
    .avatar-upload .avatar-edit {
        position: absolute;
        right: 12px;
        z-index: 1;
        top: 10px;
    }
    .avatar-upload .avatar-edit input {
        display: none;
    }
    .avatar-upload .avatar-edit input + label {
        display: inline-block;
        width: 34px;
        height: 34px;
        margin-bottom: 0;
        border-radius: 2px;
        background: #ffffff;
        border: 1px solid transparent;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        font-weight: normal;
        transition: all 0.2s ease-in-out;
    }
    .avatar-upload .avatar-edit input + label:hover {
        background: #f1f1f1;
        border-color: #d6d6d6;
    }
    .avatar-upload .avatar-preview {
        width: 203px;
        height: 192px;
        position: relative;
        border-radius: 2px;
        border: 3px solid #f8f8f8;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
    }
    .avatar-upload .avatar-preview > div {
        width: 100%;
        height: 100%;
        border-radius: 2px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>