import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { PEntregaPage } from './../p-entrega/p-entrega';

//servicio
import { DatabaseProvider } from './../../providers/database/database';
//GEolocalizacion
import { Geolocation } from '@ionic-native/geolocation'
//network plugin
import { Network } from '@ionic-native/network';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

//toast de advertencia
import { ToastController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: "page-punto-entrega",
  templateUrl: "punto-entrega.html"
})
export class PuntoEntregaPage {
  contadorGuardado: number;
  contadorSincro:number;
  ContadorTotal:number;
  Rutas:any = []
  susbcription;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private databaseProvider: DatabaseProvider,
    private geolocation: Geolocation,
    private transfer: FileTransfer,
    private network: Network,
    private ToastCtrl: ToastController,
  ) {
    
    this.susbcription = this.geolocation.watchPosition();
    this.databaseProvider.ListarRutas().then(dat => {
            this.Rutas = dat
           // console.log(dat);
    });
  }

  ionViewDidLoad(){
    this.databaseProvider.ContadorGuardado().then((contadorGurdado) =>{
        this.contadorGuardado =  Number(contadorGurdado);
    },(error) =>{
      console.log(error);
    }).then(() =>{
      this.databaseProvider.ContadorSincro().then((contadorSin) =>{
          this.contadorSincro = Number(contadorSin);
      },(error)=>{
        console.log(error);
    
      }).then(()=>{
        this.databaseProvider.ContadorTotal().then((contaT) =>{
          this.ContadorTotal = Number(contaT);
        })
      })
    })



  }

  

  TerminarProceso() {}
  // ir(id:number) {
  //   this.geolocation.getCurrentPosition({timeout:4000}).then(ubicacion => {
  //     let lat = ubicacion.coords.latitude;
  //     let lng = ubicacion.coords.longitude;
  //     this.navCtrl.push(PEntregaPage, { 'id': id, 'latitud':lat, 'longitud':lng }).then(() =>{
  //       console.log("si hay ubicacion");
  //     });
  //   }).catch(error =>{
  //     let lng = "no existe Longitud";
  //     let lat = "no exixte latitud";
  //     this.navCtrl.push(PEntregaPage, { 'id': id, 'latitud': lat, 'longitud': lng }).then(()=>{
  //       console.log("no hay ubicacion");
  //     });
  //   })
  // }
ir(id:number){

  //const
  

  this.navCtrl.push(PEntregaPage, { 'id': id, sus:this.susbcription});

}


  Sincronizar() {
    if (this.network.type == "none") {
      let toast1 = this.ToastCtrl.create({
        message: 'No hay internet para sincronizar',
        // duration:7000,
        showCloseButton: true,
        closeButtonText:'OK'
      });

      toast1.onDidDismiss(()=>{

      });

      toast1.present();

    }else{
      this.databaseProvider.ListarSincro().then(json => {
       
        let Json: any = []
        Json = json

        
          
          if (Json.length > 0) {
            
            for (let i = 0; i < Json.length; i++) {
              
              this.SubirFoto(Json[i].id, Json[i].foto, Json[i].punto_distribucion,Json[i].ejemplares,
              Json[i].ubicacion,Json[i].repartidor,Json[i].fecha_hora_entrega,Json[i].version)
            }

          } else {

            let toast2 = this.ToastCtrl.create({
              message: 'No hay nada por sincronizar',
              duration: 3500,

            });
            toast2.onDidDismiss(()=>{});

            toast2.present();


          }
         
      });
    }
     
  }

  SubirFoto(id:number,path: any, punto_distribucion: number, ejemplares: string,
    ubicacion: string, repartidor: number, fecha_hora_entrega: any, version: any){
      const fileTransfer:FileTransferObject = this.transfer.create();
      this.databaseProvider.SacarToken().then(token_accss =>{
        var url = this.databaseProvider.urlEntregarepartidor;
        var tarjetPath = path;
        var filename = tarjetPath.split("/").pop();
        var parametros = {
          'punto_distribucion': punto_distribucion,
          'ejemplares': ejemplares,
          'ubicacion': ubicacion,
          'repartidor': repartidor,
          'fecha_hora_entrega': fecha_hora_entrega,
          'version': version
        }
        var options:FileUploadOptions = {
          httpMethod: 'POST',
          fileKey: 'foto',
          fileName: filename,
          params: parametros,
          chunkedMode: false,
          mimeType: "multipart/form-data",
          headers: { 'Authorization': 'Bearer ' + token_accss}
        };
        fileTransfer.upload(tarjetPath,url,options).then((data) =>{
          let toast3= this.ToastCtrl.create({
            message:'Sincronizado con exito',
            duration:1000,
          });
          toast3.onDidDismiss(() =>{});
          toast3.present();
          let s: string = "sincro";
          this.databaseProvider.GuardarSincro(s).then(() =>{
            this.databaseProvider.EliminarSincro(id)
            this.navCtrl.setRoot(PuntoEntregaPage);  
          });
          
        },((err) =>{
          let toast4 =  this.ToastCtrl.create({
            message:'Hubo un error' + err+' '+'Vuelva a intentar o contacte a soporte',
            showCloseButton: true,
            closeButtonText: 'OK'

          });
          toast4.onDidDismiss(()=>{});
          toast4.present();
         // console.log(err)
        })
      )
      });
    }
}
