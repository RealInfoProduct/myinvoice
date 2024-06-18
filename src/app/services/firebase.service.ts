import { Injectable } from '@angular/core';
import { addDoc, collectionData, deleteDoc, doc, Firestore, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { PartyList, FirmList, ProductList, RegisterUser, InvoiceList } from '../interface/invoice';
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


  /////////////////////// Party List Data ////////////////////////

  addParty(payload: PartyList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'PartyList'), payload)
  }

  getAllParty() {
    let dataRef = collection(this.fService, 'PartyList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteParty(deleteId: any) {
    let docRef = doc(collection(this.fService, 'PartyList'), deleteId);
    return deleteDoc(docRef)
  }

  updateParty(updateId: PartyList, payload: any) {
    let dataRef = doc(this.fService, `PartyList/${updateId}`);
    return updateDoc(dataRef, payload)
  }

  /////////////////////// Firm List Data ////////////////////////


  addFirm(payload: FirmList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'FirmList'), payload)
  }

  getAllFirm() {
    let dataRef = collection(this.fService, 'FirmList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteFirm(deleteId: any) {
    let docRef = doc(collection(this.fService, 'FirmList'), deleteId);
    return deleteDoc(docRef)
  }

  updateFirm(updateId: FirmList, payload: any) {
    let dataRef = doc(this.fService, `FirmList/${updateId}`);
    return updateDoc(dataRef, payload)
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

  /////////////////////// Invoice List ////////////////////////


  addInvoice(data: InvoiceList) {
    data.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'InvoiceList'), data)
  }

  
  updateInvoice(updateId: InvoiceList, payload: any) {
    let dataRef = doc(this.fService, `InvoiceList/${updateId}`);
    return updateDoc(dataRef, payload)
  }



  getAllInvoice() {
    let dataRef = collection(this.fService, 'InvoiceList')
    return collectionData(dataRef, { idField: 'id' })
  }


}