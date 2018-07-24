
//import { AlertController } from 'ionic-angular';

import { Injectable } from '@angular/core';

//base de datos
import { SQLiteObject } from '@ionic-native/sqlite';
//http recibir
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

//storage
import { Storage } from "@ionic/storage";

//sqlite
import { SQLitePorter } from '@ionic-native/sqlite-porter';




@Injectable()
export class DatabaseProvider {
  //---------------------------------------------Base de datos-----------------------------------------
  db: SQLiteObject = null;
  private urlToken: string = "http://884b9cfb.ngrok.io/oauth2/token/";
  public urlTokenPersona: string = "http://884b9cfb.ngrok.io/auth/user/me";
  public urlRutas: string = "http://884b9cfb.ngrok.io/catalogos/api/rutadelrepartidor";
  public urlEntregarepartidor: string = "http://884b9cfb.ngrok.io/catalogos/api/entregarepartidor/"
  constructor(
    private http: Http,
    private storage: Storage,
    private sqlitePorter: SQLitePorter,
    //private alertCtrl: AlertController
  ) {}

  setDatabase(db: SQLiteObject) {
    if (this.db === null) {
      this.db = db;
    }
  }

  //-----------------------------------------Crear tablas que seran llamadas------------------------------------------------
  createTableRuta() {
    let sql =
      "CREATE TABLE IF NOT EXISTS ruta(id INTEGER , canal INTEGER, nombre VARCHAR(100), direccion VARCHAR(100)," +
      "ubicacion VARCHAR(100), ruta INTEGER, activo TEXT, b boolean default 0 check(b in (0,1)))";
    // Parte de SQLITE
    //, b boolean default 0 check(b in (0,1))
    return this.db.executeSql(sql, []);
  }
  createTableEntrega() {
    let sql =
      "CREATE TABLE IF NOT EXISTS entrega(id INTEGER PRIMARY KEY AUTOINCREMENT, punto_distribucion INTEGER, ejemplares INTEGER," +
      "foto TEXT, ubicacion TEXT, repartidor INTEGER, fecha_hora_entrega VARCHAR(100), version VARCHAR(100))";
    return this.db.executeSql(sql, []);
  }
  createTableGuardar() {
    let sql =
      "CREATE TABLE IF NOT EXISTS guarda(id INTEGER PRIMARY KEY AUTOINCREMENT, guardado TEXT)";
    return this.db.executeSql(sql, []);
  }
  createTableSincro() {
    let sql =
      "CREATE TABLE IF NOT EXISTS sincro(id INTEGER PRIMARY KEY AUTOINCREMENT, sincronizado TEXT)";
    return this.db.executeSql(sql, []);
  }

  createTableSincroSinGuardar(){
    let sql = 
      "CREATE TABLE IF NOT EXISTS sin_guardar(id INTEGER PRIMARY KEY AUTOINCREMENT, punto_distribucion INTEGER, ejemplares INTEGER," +
      "foto TEXT, ubicacion TEXT, repartidor INTEGER, fecha_hora_entrega VARCHAR(100), version VARCHAR(100))"
    return this.db.executeSql(sql,[]);  
  }
  //guardarToken() {
  //let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
  // this.http
  // .post(this.urlToken, {
  //     client_id: "Vok1rsvxrNV5uT6OKQVJXBFD0OaLvn5FzAENn2to",
  //     grant_type: "password",
  //     username: "enrique.tun",
  //     password: "devtest07"
  //   })
  //   .map(data => data.json())
  //   .subscribe(dato => {
  //     console.log(dato);
  // console.log(dato.access_token);
  // console.log(dato.expires_in);
  // console.log(dato.refresh_token);
  // console.log(dato.scope);
  // console.log(dato.token_type);
  //       return new Promise((resolve, reject) => {
  //         let sql = "INSERT INTO token(access_token, token_type, expires_in, refresh_token, scope)" + "VALUES(?, ?, ?, ?, ?)";
  //         this.db
  //           .executeSql(sql, [
  //             dato.access_token,
  //             dato.token_type,
  //             dato.expires_in,
  //             dato.refresh_token,
  //             dato.scope

  //           ])
  //           .then(
  //             data => {
  //               resolve(data)

  //               console.log(data.rows.token_type);
  //               console.log(data.rows.access_token);
  //               let token = data.rows.token_type+ data.rows.access_token;
  //               console.log(token);
  //             },
  //             error => {
  //               reject(error);
  //             }
  //           );
  //       });
  //     });
  // }

  TokenStorage() {
    return new Promise((resolve, reject) => {
      this.http
        .post(this.urlToken, {
          client_id: "Vok1rsvxrNV5uT6OKQVJXBFD0OaLvn5FzAENn2to",
          grant_type: "password",
          username: "enrique.tun",
          password: "devtest07"
        })
        .map(data => data.json())
        .subscribe(dato => {
          //console.log(dato);
          this.storage.set("token", dato).then(
            dat => {
              //this.info = dat;
              resolve(dat);
            },
            errorr => {
              reject(errorr);
            }
          );
        });
    });
  }

  segundoEnvio(info: any) {
    //console.log(info);
    //console.log(info.access_token);
    //console.log(info.token_type)

    return new Promise((resolve, reject) => {
      var suma = info.token_type + " " + info.access_token;
      let headers = new Headers({ Authorization: suma });
      this.http
        .get(this.urlTokenPersona, { headers })
        .map(data => data.json())
        .subscribe(
          dat => {
            //console.log(dat);
            // console.log(dat.username);
            // console.log(dat.password);
            // console.log(dat.last_name);

            this.storage.set("user", dat);
            resolve(dat.username);
          },
          errorr => {
            reject(errorr);
          }
        );
    });
    //console.log(suma);
  }

  Usuario() {
    return new Promise((resolve, reject) => {
      this.storage.get("user").then(
        dato => {
          resolve(dato);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  UsuarioId() {
    return new Promise((resolve, reject) => {
      this.storage.get("user").then(
        dato => {
          resolve(dato.id);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  SacarToken(){
      return new Promise((resolve, reject)=>{
        this.storage.get("token").then(acc_tjoken =>{
          resolve(acc_tjoken.access_token);
        }, error =>{
          reject(error);
        });
      });
  }

  PrepararRutas() {
    this.storage.get("token").then(dato => {
      //console.log(dato);
      var LinkRuta = dato.token_type + " " + dato.access_token;
      let headers = new Headers({ Authorization: LinkRuta });
      this.http
        .get(this.urlRutas, { headers })
        .map(data => data.json())
        .subscribe(dat => {
          //console.log(dat);
          if (dat.length > 0) {
            for (let i = 0; i < dat.length; i++) {
              var json = {
                data: {
                  inserts: {
                    ruta: [
                      {
                        id: dat[i].id,
                        canal: dat[i].canal,
                        nombre: dat[i].nombre,
                        direccion: dat[i].direccion,
                        ubicacion: dat[i].ubicacion,
                        ruta: dat[i].ruta,
                        activo: dat[i].activo,
                        b: 0
                      }
                    ]
                  }
                }
              };
              this.sqlitePorter
                .importJsonToDb(this.db, json)
                .then(() => console.log("IMPORTADO"))
                .catch(e => console.error(e));
            }
          }
        });
    });
  }

  ListarRutas() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT * FROM ruta", []).then(
        data => {
          let lista: any = [];

          if (data.rows.length > 0) {
            for (var i = 0; i < data.rows.length; i++) {
              lista.push({
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                direccion: data.rows.item(i).direccion,
                b: data.rows.item(i).b
              });
            }
          }

          resolve(lista);
        },
        errot => {
          reject(errot);
        }
      );
    });
  }
//---------------------------------Actualizar la parte visual de check o no cheak----------------------------------------
  Actualizar(id: number) {
    this.db
      .executeSql("UPDATE ruta SET b = 1 WHERE id ='" + id + "'", [])
      .then(() => {
        console.log("se actualizo");
      });
  }
//---------------------------------Buscar---------------------------------------------------------------------------------
  Buscar(id: number) {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT * FROM ruta WHERE id ='" + id + "'", []).then(
        data => {
          let HRutas: any = [];
          if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
              HRutas.push({
                id: data.rows.item(i).id,
                nombre: data.rows.item(i).nombre,
                direccion: data.rows.item(i).direccion
              });
            }
          }
          resolve(HRutas);
        },
        error => {
          reject(error);
        }
      );
    });
  }
// ---------------------------------------------------------------------Contador---------------------------------------------------
  ContadorTotal() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT COUNT (*) as total FROM entrega", null).then(
        data => {
          resolve(data.rows.item(0).total);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  ContadorSincro() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT COUNT (*) as total FROM sincro", null).then(
        data => {
          resolve(data.rows.item(0).total);
        },
        error => {
          reject(error);
        }
      );
    });
  }
  ContadorGuardado() {
    return new Promise((resolve, reject) => {
      this.db.executeSql("SELECT COUNT (*) as total FROM sin_guardar", null).then(
        data => {
          resolve(data.rows.item(0).total);
        },
        error => {
          reject(error);
        }
      );
    });
  }


  ComprobarRutas(){
    return new Promise((resolve, reject) =>{
      this.db.executeSql("SELECT COUNT (*) as total FROM ruta", null).then((data) =>{
        resolve(data.rows.item(0).total);
      },(error)=>{
        reject(error);
      });
    });
  }

  // ---------------------------------------------------Guardar-----------------------------------------------------------------------
  GuardarEncuesta(punto_distribucion: number, ejemplares: string, foto: string, ubicacion: string, repartidor: number, fecha_hora_entrega:any, version:any)
  {
    return new Promise((resolve, reject) => {
      let sql = "INSERT INTO entrega(punto_distribucion, ejemplares, foto, ubicacion, repartidor, fecha_hora_entrega, version)" + "VALUES(?, ?, ?, ?, ?, ?, ?)";

      this.db.executeSql(sql, [punto_distribucion, ejemplares, foto, ubicacion, repartidor, fecha_hora_entrega, version]).then(data => {
          resolve(data);
        }, (errror) =>{
          reject(errror);
        });
    });
  }

  GuardarSincro(sincro:string){
    return new Promise((resolve, reject) =>{
      let sql = "INSERT INTO sincro(sincronizado) VALUES (?)";
      this.db.executeSql(sql,[sincro]).then(data =>{
        resolve(data);
      },(errpr) =>{
        reject(errpr);
      })
    });
  }


  GuardarGuardar(Guardar:string){
    return new Promise ((resolve, reject) =>{
      let sql = "INSERT INTO guarda(guardado) VALUES (?)";
      this.db.executeSql(sql,[Guardar]).then(data =>{
        resolve(data);
      },(error) =>{
        reject(error);
      })
    });
  }

  GuardarEncuestaSincro(punto_distribucion: number, ejemplares: string, foto: string, ubicacion: string, repartidor: number, fecha_hora_entrega: any, version: any)
  {
    return new Promise((resolve, reject) =>{
      let sql = "INSERT INTO sin_guardar(punto_distribucion, ejemplares, foto, ubicacion, repartidor, fecha_hora_entrega, version)" + "VALUES(?, ?, ?, ?, ?, ?, ?)";
      this.db.executeSql(sql,[punto_distribucion, ejemplares, foto, ubicacion, repartidor, fecha_hora_entrega, version]).then(data => {
        resolve(data);
      },(errror)=>{
        reject(errror);
      });
    });
  }
//------------------------------------------Listar Sincro-----------------------------------------------------------------------
ListarSincro(){
  return new Promise((resolve, reject) =>{
    this.db.executeSql("SELECT * FROM sin_guardar",[]).then((data)=>{
      let arreglo = [];
      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          arreglo.push({
            id:data.rows.item(i).id,
            punto_distribucion: data.rows.item(i).punto_distribucion,
            ejemplares: data.rows.item(i).ejemplares,
            foto:data.rows.item(i).foto,
            ubicacion: data.rows.item(i).ubicacion,
            repartidor:data.rows.item(i).repartidor,
            fecha_hora_entrega:data.rows.item(i).fecha_hora_entrega,
            version:data.rows.item(i).version 
          });
          
        };
      };
      resolve(arreglo);
    },(error) => {
      reject(error);
    });
  });
}
EliminarSincro(id:number){
  this.db.executeSql("DELETE FROM sin_guardar WHERE id ='"+id+"'",[])
    .then(() => {
      console.log("SE ELIMINO PERO SI SE SINCRONIZO");
    });
}
}
