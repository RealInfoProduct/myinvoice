import { Injectable } from '@angular/core';
import { addDoc, collectionData, deleteDoc, doc, Firestore, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ProductList, RegisterUser, PurchaseList } from '../interface/invoice';
import { collection } from '@firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { from } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {


  constructor(private fService: Firestore, private authentication: Auth) { }


  /////////////////////// registerUser List ////////////////////////


  addUserList(data: RegisterUser) {
    data.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'RegisterUser'), data)
  }

  getUserList() {
    let dataRef = collection(this.fService, 'RegisterUser')
    return collectionData(dataRef, { idField: 'id' })
  }


  /////////////////////// Product List Data ////////////////////////


  addProduct(payload: ProductList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'ProductList'), payload)
  }

  getAllProduct() {
    let dataRef = collection(this.fService, 'ProductList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteProduct(deleteId: any) {
    let docRef = doc(collection(this.fService, 'ProductList'), deleteId);
    return deleteDoc(docRef)
  }

  updateProduct(updateId: ProductList, payload: any) {
    let dataRef = doc(this.fService, `ProductList/${updateId}`);
    return updateDoc(dataRef, payload)
  }


  
  /////////////////////// Purchase List Data ////////////////////////


  addPurchase(payload: PurchaseList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'PurchaseList'), payload)
  }

  getAllPurchase() {
    let dataRef = collection(this.fService, 'PurchaseList')
    return collectionData(dataRef, { idField: 'id' })
  }

  updatePurchase(updateId: PurchaseList, payload: any) {
    let dataRef = doc(this.fService, `PurchaseList/${updateId}`);
    return updateDoc(dataRef, payload)
  }

  deletePurchase(deleteId: any) {
    let docRef = doc(collection(this.fService, 'PurchaseList'), deleteId);
    return deleteDoc(docRef)
  }
}