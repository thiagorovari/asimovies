import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {

  name: string = '';
  email: string ='';
  password: string = '';
  confirmPassword: string = '';

  constructor(private auth: AuthService) {}

  validateForm(): boolean {
    return this.name !== '' &&
           this.email !== '' &&
           this.password !== '' &&
           this.confirmPassword !== '';
  }

  cadastrar(){
    if(this.validateForm()){
      this.auth.cadastro(this.name,this.email,this.password,this.confirmPassword)
    }else{ 
      alert('Preencha todos os campos');
    }
  }
  cadastrarComGoogle() {
    this.auth.loginWithGoogle()
      .then(user => {
        if (user) {
          console.log('Usuário cadastrado com Google:', user);
          
        }
      })
      .catch(error => {
        console.error('Erro ao cadastrar com Google:', error);
      });
  }
  
}