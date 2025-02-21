import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrl: './add-movie.component.scss'
})
export class AddMovieComponent {

  movieForm!: FormGroup;
  selectedFile: File | null = null; // foto do filme
  previewUrl: string | null = null; // pré visualização da imagem do filme

  @Input() editingMovie: any = null; // 🔹 Recebe o filme a ser editado

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.movieForm = this.fb.group({
      name: ['', [Validators.required]],
      rating: [0, [Validators.required]],
      analysis: ['', [Validators.required]],
      photo_path: ['']
    });
  
    // 🔹 Se estiver editando um filme, preencher o formulário
    if (this.editingMovie) {
      this.movieForm.patchValue({
        name: this.editingMovie.name,
        rating: this.editingMovie.rating,
        analysis: this.editingMovie.analysis,
        photo_path: this.editingMovie.photo_path
      });
  
      this.previewUrl = this.editingMovie.photo_path;
    }
  }

  setRating(rating: number) {
    // Atualiza o valor de 'rating' no formulário
    this.movieForm.patchValue({
      rating: rating
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.movieForm.valid) {
      const formData = this.movieForm.value;

      // 🔹 Se houver uma imagem, faça o upload primeiro
      if (this.selectedFile) {
        const filePath = `movies/${new Date().getTime()}_${this.selectedFile.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedFile);

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              formData.photo_path = url; // Atualiza a URL da imagem

              if (this.editingMovie) {
                this.updateMovie(formData);
              } else {
                this.addMovie(formData);
              }
            });
          })
        ).subscribe();
      } else {
        // Se não houver imagem nova, edita com os dados antigos
        if (this.editingMovie) {
          this.updateMovie(formData);
        } else {
          this.addMovie(formData);
        }
      }
    }
  }
  private saveMovieData(formData: any) {
    this.databaseService.addDocument('movies', formData).then(() => {
      console.log('Filme adicionado com sucesso!');
      this.movieForm.reset();
      this.previewUrl = null; // Reseta a pré-visualização da imagem
      this.selectedFile = null;
    }).catch((error) => {
      console.error('Erro ao adicionar filme:', error);
    });
  }
  // 🔹 Atualizar Filme
private updateMovie(formData: any) {
  this.databaseService.updateDocument('movies', this.editingMovie.id, formData).then(() => {
    console.log('Filme atualizado com sucesso!');
    this.closeModal.emit(); // Fechar modal
  }).catch((error) => {
    console.error('Erro ao atualizar filme:', error);
  });
}

// 🔹 Adicionar Novo Filme
private addMovie(formData: any) {
  this.databaseService.addDocument('movies', formData).then(() => {
    console.log('Filme adicionado com sucesso!');
    this.movieForm.reset();
    this.previewUrl = null;
    this.selectedFile = null;
    this.closeModal.emit(); // Fechar modal
  }).catch((error) => {
    console.error('Erro ao adicionar filme:', error);
  });
}



  // variável que emite um evento para o componente da home
  @Output() closeModal = new EventEmitter<void>();

  // Função que emite o evento para o componente da home, fechando o Modal
  onClose() {
    this.closeModal.emit();
  }
}