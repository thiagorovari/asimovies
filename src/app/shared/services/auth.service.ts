import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserInterface } from '../interfaces/user-interface';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth, private firestore: AngularFirestore, private router: Router) { }

  cadastro(name: string, email: string, password: string, confirmPassword: string){
    if(password !== confirmPassword){
      alert('As senhas não coincidem.');
      return;
    }

    this.auth.createUserWithEmailAndPassword(email, password).then(async userCredential =>{
      const user = userCredential?.user;

      if(user){
        const userData: UserInterface = {
          name: name,
          email: email,
          tipo: 'Usuário'
        }

        await this.salvarDados(user.uid,userData);
        user.sendEmailVerification();
        this.auth.signOut();
      }
    })
    .catch(error=>{
      console.log(error)
    })
  }

  salvarDados(id: string, user: UserInterface){
    return this.firestore.collection('users').doc(id).set(user);
  }

  login(email: string, password: string) {
    console.log('Login method called'); // Log para verificar se o método está sendo chamado
    this.auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
      console.log('User credential:', userCredential); // Log para verificar as credenciais do usuário
      if (userCredential.user?.emailVerified) {
        console.log('Email is verified'); // Log para verificar se o email está verificado
        console.log('sucesso');
        this.router.navigate(['/home']);
      } else {
        console.log('Email is not verified'); // Log para verificar se o email não está verificado
      }
    })
    .catch((error) => {
      console.log('Login error:', error); // Log para verificar erros de login
    });
  }

  redefinirSenha(email: string){
    this.auth.sendPasswordResetEmail(email).then(()=>{ }).catch((error) => {
      console.log(error)
    })
  }

  logout(){
    this.auth.signOut().then(()=>{
      this.router.navigate(['/'])
    }).catch((error) =>{
      console.log(error)
    })
  }

  getUserData(): Observable<any>{
    return this.auth.authState.pipe(
      switchMap(user => {
        if(user){
          return this.firestore.collection('users').doc(user.uid).valueChanges();
        } else {
          return of(null)
        }
      })
    )
  }
}