import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

//plugin version
import { AppVersion } from '@ionic-native/app-version';
//formulario
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


//pagina inicio
import { PuntoEntregaPage } from '../punto-entrega/punto-entrega';
//plugin android permiss
import { AndroidPermissions } from "@ionic-native/android-permissions";
//servicio
import { DatabaseProvider } from './../../providers/database/database';

import * as CryptoJS from "crypto-js";

//toast de advertencia
import { ToastController } from 'ionic-angular';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  SecionForm: FormGroup;
  version: any;
  //CryptoJS = require ("crypto-js");

  constructor(
    public navCtrl: NavController,
    private appVersion: AppVersion,
    validatorForm: FormBuilder,
    androidPermissions: AndroidPermissions,
    private databaseProvider: DatabaseProvider,
    private ToastCtrl: ToastController,
    private loadingCtrl:LoadingController
  ) {
    //    databaseProvider.guardarToken();

    this.SecionForm = validatorForm.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]]
    });

    androidPermissions
      .checkPermission(androidPermissions.PERMISSION.CAMERA)
      .then(
        success => console.log("Tiene Permiso de camara"),
        err =>
          androidPermissions.requestPermission(
            androidPermissions.PERMISSION.CAMERA
          )
      );
    androidPermissions
      .checkPermission(androidPermissions.PERMISSION.INTERNET)
      .then(
        succes => console.log("Tienes Permiso de Internet"),
        err =>
          androidPermissions.requestPermission(
            androidPermissions.PERMISSION.INTERNET
          )
      );
    databaseProvider.Usuario();
  }

  async ionViewDidLoad() {
    this.version = await this.appVersion.getVersionNumber();
  }

  login() {
    this.databaseProvider.Usuario().then(dato => {
      let JsonConvertir = JSON.stringify(dato);
      let JsonPuro = JSON.parse(JsonConvertir);
      //console.log(JsonPuro);

      if (this.SecionForm.value.username == JsonPuro.username) {
        let hash = JsonPuro.password;
      //  console.log(hash);
        let parts = hash.split("$");
      //  console.log(parts);
        let salt = parts[1];
      //  console.log(salt);
        if ("sha1$" + salt + "$" + CryptoJS.SHA1(salt + this.SecionForm.value.password) == hash) {
            this.databaseProvider.ComprobarRutas().then(ruta =>{
                console.log(ruta);
              if (Number(ruta) == 0) {
                 

                console.log("hay que crear ruta");
                let cargar = this.loadingCtrl.create({
                  spinner: 'dots',
                  content: 'Cargando Listas'
                });

                cargar.present().then(() => {
                  this.databaseProvider.PrepararRutas();
                })

                setTimeout(() => {
                  this.navCtrl.setRoot(PuntoEntregaPage, { usuario: JsonPuro.username });
                }, 4000);
                setTimeout(() => {
                  cargar.dismiss();
                }, 6000);

               
              }else{
                console.log("hay ruta");
                this.navCtrl.setRoot(PuntoEntregaPage, { usuario: JsonPuro.username })
              }


            });

          
        } else {
          let toast = this.ToastCtrl.create({
            message: 'Contraseña invalida',
            duration: 3000,
            position: 'top'
          });
          toast.onDidDismiss(() =>{

          });
          toast.present();
        }
      } else {
        let toast2 = this.ToastCtrl.create({
          message: 'Usuario Invalido',
          duration:3000,
          position: 'top'
        });
        toast2.onDidDismiss(() =>{

        });
        toast2.present();
      }
    });
  }
}
