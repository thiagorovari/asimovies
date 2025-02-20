import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-update-card',
  templateUrl: './update-card.component.html',
  styleUrl: './update-card.component.scss'
})
export class UpdateCardComponent {


  movieForm!: FormGroup;
  selectedFile: File | null = null; // foto do filme
  previewUrl: string | null = null; // pré visualização da imagem do filme
  
  @Input() editingMovie: any = null;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private storage: AngularFireStorage
  ) {}
  

  ngOnInit(){
    this.movieForm = this.fb.group({
      name: ['', [Validators.required]],
      rating: [0, [Validators.required]],
      analysis: ['', [Validators.required]],
      photo_path: ['']
    });

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

  onSubmit(){
  if (this.movieForm.valid) {
    const formData = this.movieForm.value;

    if (this.editingMovie) {
      const filePath = `movies/${this.editingMovie.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);

      task.snapshotChanges().subscribe(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          formData.photo_path = url;
          this.databaseService.updateDocument('movies','movie.id', formData).then(() => {
            console.log('Documento Atualizado!');
            this.movieForm.reset();
            this.previewUrl = null;
            this.selectedFile = null;
          }).catch((error) => {
            console.log(error);
          });
        });
      });
    } else {
      this.databaseService.addDocument('movies', formData).then(() => {
        console.log('Documento AA!');
        this.movieForm.reset();
      })
    }
  }
  }
  deleteMovie(id:string){
    this.databaseService.deleteDocument('movies',id).then(()=>{
      console.log("Documento excluído com sucesso.")
    }).catch(error=>{
      console.log(error)
    })
  }

  // variável que emite um evento para o componente da home
  @Output() closeModal = new EventEmitter<void>();

  // Função que emite o evento para o componente da home, fechando o Modal
  onClose() {
    this.closeModal.emit();
  }
}
