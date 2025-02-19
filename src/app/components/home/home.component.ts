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

  constructor(private databaseService: DatabaseService) {}

  ngOnInit(){
    this.databaseService.getCollection('movies').subscribe((movies: MovieInterface[])=>{
      this.movies = movies;
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit); 
    })
  }

  deleteMovie(id:string){
    this.databaseService.deleteDocument('movies',id).then(()=>{
      console.log("Documento excluído com sucesso.")
    }).catch(error=>{
      console.log(error)
    })
  }

  toggleAddMovieModal(){
    this.showAddMovieModal = !this.showAddMovieModal; 
  }

  filterMovies(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const sanitizedQuery = query.replace(/[\.\-]/g, '');
  
    if (sanitizedQuery === '') {
      
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    } else {
      
      const filteredMovies = this.movies.filter(movie => {
        const titleMatch = movie.name ? movie.name.toLowerCase().includes(sanitizedQuery) : false;
        return titleMatch;
      });
  
      
      this.currentOffset = 0;
      this.displayedMovies = filteredMovies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }

  
  showNext() {
    if (this.currentOffset + this.limit < this.movies.length) {
      this.currentOffset += this.limit;
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }

  
  showPrevious() {
    if (this.currentOffset - this.limit >= 0) {
      this.currentOffset -= this.limit;
      this.displayedMovies = this.movies.slice(this.currentOffset, this.currentOffset + this.limit);
    }
  }
}