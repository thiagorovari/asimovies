import { Component } from '@angular/core';
import { MovieInterface } from '../../shared/interfaces/movie-interface';
import { DatabaseService } from '../../shared/services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  // VARIÁVEIS

  showAddMovieModal: boolean = false; // controle de exibição do modal de adição de filme
  searchQuery: string = ''; // controle de pesquisa de filmes
  displayedMovies: MovieInterface[] = []; // filmes exibidos na tela
  movies: MovieInterface[] = []; 
  limit: number = 4; // 4 filmes no maximo por vez
  currentOffset: number = 0; // controle de visualização de filmes
  editingMovie: any | null = null; // 🔹 Armazena o filme que está sendo editado

  constructor(private databaseService: DatabaseService){}

  ngOnInit(){
this.databaseService.getCollection('movies').subscribe((movies: MovieInterface[])=>{
  this.movies = movies;
  this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit); // exibe os 4 filmes iniciais
});
  }

  deleteMovie(id: string){
    this.databaseService.deleteDocument('movies',id).then(()=>{
      console.log("Documento excluído com sucesso.")
    }).catch(error =>{
      console.log(error)
    })
  }

  // 🔹 Abrir modal para editar filme
  editMovie(movie: any) {
    this.editingMovie = movie; // 🔹 Passa o filme para o modal
    this.showAddMovieModal = true;
  }

  // 🔹 Abrir modal para adicionar filme
  addMovie() {
    this.editingMovie = null;
    this.showAddMovieModal = true;
  }

    


  toggleAddMovieModal(){
    this.showAddMovieModal = !this.showAddMovieModal; // abre e fecha o modal
  }

  filterMovies(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const sanitizedQuery = query.replace(/[\.\-]/g, '');
  
    if (sanitizedQuery === '') {
      // Se não houver pesquisa, exibe a página atual normalmente
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    } else {
      // Filtra sobre todos os filmes
      const filteredMovies = this.movies.filter(movie => {
        const titleMatch = movie.name ? movie.name.toLowerCase().includes(sanitizedQuery) : false;
        return titleMatch;
      });
  
      // Reinicia o offset para começar da primeira página do resultado filtrado
      this.currentOffset = 0;
      this.displayedMovies = filteredMovies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }

  // avançar no layout de filmes (4 por vez)
  showNext() {
    if (this.currentOffset + this.limit < this.movies.length) {
      this.currentOffset += this.limit;
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }

  // voltar no layout de filmes (4 por vez)
  showPrevious() {
    if (this.currentOffset - this.limit >= 0) {
      this.currentOffset -= this.limit;
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }
}

 