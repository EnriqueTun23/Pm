import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

//plugin camera
import { Camera, CameraOptions } from '@ionic-native/camera';
//File
import { File } from '@ionic-native/file';
//network plugin
import { Network } from '@ionic-native/network';
//pagina para navegar
import { PuntoEntregaPage } from './../punto-entrega/punto-entrega';
//import data base
import { DatabaseProvider } from './../../providers/database/database';

//validar formu
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

//version de la APK
import { AppVersion } from '@ionic-native/app-version';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
//toast de advertencia
import { ToastController } from 'ionic-angular';



@IonicPage()
@Component({
  selector: "page-p-entrega",
  templateUrl: "p-entrega.html"
})
export class PEntregaPage {
  punto_de_distribucion_id: number;
  usuario_id:number;
  contador: number = 2;
  image: string ="assets/imgs/TomarFoto.jpg";
  datos:any =[];
  formulario:FormGroup;
  Fecha:string;
  latitud:string;
  longitud:string;
  ubicacion:string;
  contadorGuardado: number;
  contadorSincro: number;
  ContadorTotal: number;
  subscription;
  versionAPP: any;
  storageDirectory: string = '';
  imgjpg:any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private file: File,
    private network: Network,
    private databaseProvider: DatabaseProvider,
    private fv: FormBuilder,
    private transfer: FileTransfer,
    private appVersion: AppVersion,
    private ToastCtrl: ToastController,
  ) {

    this.Version();
    
    this.punto_de_distribucion_id = navParams.get("id");
   // this.latitud = navParams.get("latitud");
   // this.longitud = navParams.get("longitud");
    this.subscription = navParams.get("sus")
    this.subscription.subscribe(position =>{

      console.log(position.coords.longitude + '' + position.coords.latitude);
      this.ubicacion = position.coords.longitude + ' ' + position.coords.latitude;
    })
    //this.ubicacion =  this.latitud+" "+this.longitud;
    //console.log(this.ubicacion);
    console.log(this.punto_de_distribucion_id);

    this.formulario = this.fv.group({
      ejemplar: ['', [Validators.required, Validators.minLength(2)]],
      foto:['', [Validators.required, Validators.minLength(27)]]
    });
  }

  

  ionViewDidLoad(){
    this.databaseProvider.Buscar(this.punto_de_distribucion_id).then( respue =>{
      console.log(respue);
      this.datos = respue;
      this.databaseProvider.UsuarioId().then(res =>{
        this.usuario_id =Number(res);
        console.log(this.usuario_id);
        let fecha = new Date();
        // var fecha_total =this.dia(fecha.getDay())+"-"+ fecha.getDate()+"/"+this.mes(fecha.getMonth())+"/"+fecha.getFullYear()+
        // " "+" Hora: "+fecha.getHours()+":"+fecha.getMinutes();
        //this.Fecha = fecha_total
        var fecha_total2 = fecha.getFullYear()+"-"+this.mes(fecha.getMonth())+"-"+fecha.getDate()+" "+fecha.getHours()+":"+fecha.getMinutes()+
        ":"+fecha.getSeconds()
        console.log(fecha_total2)
        this.Fecha = fecha_total2
        //console.log(this.Fecha);
        
      })
    });
    this.databaseProvider.ContadorGuardado().then((contadorGurdado) => {
      this.contadorGuardado = Number(contadorGurdado);
    }, (error) => {
      console.log(error);
    }).then(() => {
      this.databaseProvider.ContadorSincro().then((contadorSin) => {
        this.contadorSincro = Number(contadorSin);
      }, (error) => {
        console.log(error);

      }).then(() => {
        this.databaseProvider.ContadorTotal().then((contaT) => {
          this.ContadorTotal = Number(contaT);
        })
      })
    })
  }
  // dia(d){
  //   var dia = new Array(7);
  //   dia[0] = "Domingo";
  //   dia[1] = "Lunes";
  //   dia[2] = "Martes";
  //   dia[3] = "Miércoles";
  //   dia[4] = "Jueves";
  //   dia[5] = "Viernes";
  //   dia[6] = "Sábado";
  //   return dia[d];
  // }

  mes(d){
    var mes = new Array(12);
    mes[0] = "01";
    mes[1] = "02";
    mes[2] = "03";
    mes[3] = "04";
    mes[4] = "05";
    mes[5] = "06";
    mes[6] = "07";
    mes[7] = "08";
    mes[8] = "09";
    mes[9] = "10";
    mes[10] = "11";
    mes[11] = "12";
    return mes[d];
  }

  TomarFoto() {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      targetHeight: 800,
      targetWidth: 800
    };

    this.camera
      .getPicture(options)
      .then(imageData => {
        let currentName = imageData.replace(/^.*[\\\/]/, "");
        //console.log('currebtname.. '+currentName);
        var date = new Date(),
          n = date.getFullYear()+this.mes(date.getMonth())+date.getDate(),
          newFileName = this.punto_de_distribucion_id + '_' + this.usuario_id+'_'+ n + ".jpg";
          //console.log('newfile '+newFileName);
        var namePath = imageData.substr(0, imageData.lastIndexOf("/") + 1);
            
        this.file
          .moveFile(namePath, currentName, this.file.dataDirectory, newFileName)
          .then(sucess => {
            this.image = sucess.nativeURL;  
            //console.log(this.image);
          
          })
          .catch(err => console.log("no se guardo"));
      })
      .catch(error => console.log(error));
  }

  // ionViewCanLeave() {
  //   this.navCtrl.setRoot(PuntoEntregaPage);
  // }

  doConfirm(){
   
  }
  async Version() {
    this.versionAPP = await this.appVersion.getVersionNumber();
  }

  Guardar() {

    // let alert = this.alertCtrl.create({
    //   title: 'Use this lightsaber?',
    //   buttons: ['ok']
    // });


    // alert.present();
    console.log("url de la foro para partirle la madre "+" "+this.formulario.value.foto);

    if (this.network.type == "none") {
      //console.log("No hay internet para sincronizar");
      let toast1 = this.ToastCtrl.create({
        message: 'Guardado en el almacenamiento del dispositivo',
        duration:2500
      });
      toast1.onDidDismiss(()=>{});
      toast1.present();
      this.databaseProvider.GuardarEncuesta(this.punto_de_distribucion_id, this.formulario.value.ejemplar,this.formulario.value.foto,this.ubicacion, 
                                            this.usuario_id, this.Fecha, this.versionAPP).then(() =>{
                                              if (this.ubicacion) {

                                                let POIT_ubication = 'POINT(' + this.ubicacion + ')';
                                                this.databaseProvider.GuardarEncuestaSincro(this.punto_de_distribucion_id, this.formulario.value.ejemplar, this.formulario.value.foto, POIT_ubication,
                                                  this.usuario_id, this.Fecha, this.versionAPP).then(() => {
                                                    this.databaseProvider.Actualizar(this.punto_de_distribucion_id)
                                                    //let g: string = "guardado"
                                                    //this.databaseProvider.GuardarGuardar(g).then(() => {
                                                      //this.subscription.unsubscribe();
                                                      this.navCtrl.setRoot(PuntoEntregaPage);
                                                    //});
                                                  })
                                              }else{
                                                this.ubicacion = 'POINT(0 0)';
                                                this.databaseProvider.GuardarEncuestaSincro(this.punto_de_distribucion_id, this.formulario.value.ejemplar, this.formulario.value.foto, this.ubicacion,
                                                  this.usuario_id, this.Fecha, this.versionAPP).then(() => {
                                                    this.databaseProvider.Actualizar(this.punto_de_distribucion_id)
                                                   // let g: string = "guardado";
                                                   // this.databaseProvider.GuardarGuardar(g).then(() => {
                                                      //this.subscription.unsubscribe();
                                                      this.navCtrl.setRoot(PuntoEntregaPage);
                                                   // });
                                                  })
                                              }
                                             
                                              
                                                
                                            });
    } else {
      console.log("Hay internet para sincronizar");
      this.databaseProvider.GuardarEncuesta(this.punto_de_distribucion_id, this.formulario.value.ejemplar, this.formulario.value.foto, this.ubicacion,
        this.usuario_id, this.Fecha, this.versionAPP).then(() =>{
          
          if (this.ubicacion) {
            console.log(this.ubicacion)
            let POIT_ubication = 'POINT('+this.ubicacion+')';
           // console.log(POIT_ubication);
            this.subirFoto(this.image, this.punto_de_distribucion_id, this.formulario.value.ejemplar, POIT_ubication, this.usuario_id,
              this.Fecha, this.versionAPP)
          }else{
            this.ubicacion = 'POINT(0 0)';
            //let g: string = "guardado"
            // this.databaseProvider.GuardarGuardar(g).then(() => {
            //   //this.subscription.unsubscribe();
            //   this.navCtrl.setRoot(PuntoEntregaPage);
            // });
            this.subirFoto(this.image, this.punto_de_distribucion_id, this.formulario.value.ejemplar, this.ubicacion, this.usuario_id,
              this.Fecha, this.versionAPP)
          }
                              
      
          // this.databaseProvider.SincroPeriodico(this.punto_de_distribucion_id,this.formulario.value.ejemplar,this.subirFoto(this.image),this.ubicacion,
          //                                       this.usuario_id, this.Fecha, this.versionAPP);
          
                              
        
        });
      
      
    }
    
    
  
  }

  subirFoto(path: any, punto_distribucion: number, ejemplares: string,
    ubicacion: string, repartidor: number, fecha_hora_entrega: any, version: any){
  // return new Promise ((resolve, reject) =>{
    const fileTransfer: FileTransferObject = this.transfer.create();
    this.databaseProvider.SacarToken().then(token_access=>{
    //console.log(token_access);
      var url = this.databaseProvider.urlEntregarepartidor;
      console.log(url);
    var tarjetPAth = path; //file path upload
    var filename = tarjetPAth.split("/").pop();
    console.log(filename);
    var parametros = {
      'punto_distribucion':punto_distribucion,
      'ejemplares':ejemplares,
      'ubicacion':ubicacion,
      'repartidor':repartidor,
      'fecha_hora_entrega':fecha_hora_entrega,
      'version':version
    }
    console.log(parametros);
    var options: FileUploadOptions = {
      httpMethod: 'POST',
      fileKey: 'foto',
      fileName: filename,
      params:parametros,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      headers: {
        'Authorization': 'Bearer ' + token_access,
      }
    };
   fileTransfer.upload(tarjetPAth,url,options).then((data) =>{
           //resolve(resultado);
     //console.log(data + " Uploaded Successfully");
        //   console.log(data)
    //  console.log(error)
    // reject(error);
   // });
     let toast3 = this.ToastCtrl.create({
       message: 'Sincronizado con exito',
       duration: 2500,
     });
     toast3.onDidDismiss(() => { });
     toast3.present();
     this.databaseProvider.Actualizar(this.punto_de_distribucion_id);
     
     
     let s: string = "sincro";
     this.databaseProvider.GuardarSincro(s).then(() => {
      
      //this.subscription.unsubscribe();
       this.navCtrl.setRoot(PuntoEntregaPage);
      // this.file.removeFile(path,)


     });
    },(err) => {
      let toast4 = this.ToastCtrl.create({
        message: 'Hubo un error' + err + ' ' + 'Vuelva a intentar o contacte a soporte',
        showCloseButton: true,
        closeButtonText: 'OK'
      });
      toast4.onDidDismiss(() => { });
      toast4.present();
      this.databaseProvider.GuardarEncuestaSincro(this.punto_de_distribucion_id, this.formulario.value.ejemplar, this.formulario.value.foto, this.ubicacion,
        this.usuario_id, this.Fecha, this.versionAPP).then(()=>{
          this.databaseProvider.Actualizar(this.punto_de_distribucion_id);
          //let g: string = "guardado"
          //this.databaseProvider.GuardarGuardar(g).then(() => {
            //this.subscription.unsubscribe();
            this.navCtrl.setRoot(PuntoEntregaPage);
          //});
        })
      
           
      console.log(err);
    });

    });

}

}
//https://www.youtube.com/watch?v=uNzdZbDUUoU