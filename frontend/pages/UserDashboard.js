export default {
    template: `
    <div class="container my-5">
        <h1 class="text-center mb-4 p-3 mb-2"> 🌟Welcome to Online Quiz Portal🌟</h1>
        
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Available Subjects for Quiz</h2>
        <table class="table table-hover">
            <thead class="thead-dark">
                <tr>
                    <th>Subject ID</th>
                    <th>Subject Name</th>
                    <th>Description</th>
                    <th>Chapters Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="subject in subjects" :key="subject.id">
                    <td>{{ subject.id }}</td>
                    <td>{{ subject.name }}</td>
                    <td>{{ subject.description }}</td>
                    <td>
                        <span v-for="chapter in chapters.filter(c => c.subject_id === subject.id)" :key="chapter.id">
                            • {{ chapter.name }}<br>
                        </span>
                    </td>
                    <td>
                        <button @click="selectChapter(subject.id)" class="btn btn-primary">Select Chapter</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="d-flex justify-content-center mt-4 mb-4"><button @click="create_csv" class="p-3 btn btn-success">Download Your Quiz Data</button></div>
        
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Scores</h2>
        <table v-if="scores.length" class="table table-hover">
        <thead class="thead-dark">
        <tr>
            <th>Subject Name</th>
            <th>Chapter Name</th>
            <th>Quiz Title</th>
            <th>Time Spent</th>
            <th>Scores Gained</th>
            <th>Total Scores</th>
        </tr>
    </thead>
    <tbody>
    <tr v-for="score in scores" :key="score.id">
    <td>{{ score.quiz.subject.name }}</td>  
    <td>{{ score.quiz.chapter.name }}</td>
    <td>{{ score.quiz.quiz_title }}</td>
    <td>{{ score.time_spent_minutes }} min {{ score.time_spent_remaining_seconds }} sec</td>
    <td>{{ score.score_gain }}</td>
    <td>{{ score.total_scored }}</td>
</tr>

    </tbody>
</table>
<p v-else class="text-center">No scores available.</p>
   
    </div>
    `,
    
    data() {
        return {
            scores: [],
            subjects: [],
            chapters: [],
            
            };
    },

    methods: {
        async create_csv(){
            const user_id = this.$store.state.user_id; 
            const res = await fetch(location.origin + '/create-csv', {
                method: "POST",
                headers : {
                    'Content-Type' : 'application/json',
                    'Authentication-Token' : this.$store.state.auth_token
                },
                body:JSON.stringify({user_id}),
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/get-csv/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/get-csv/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
        },
        
              
    
        async fetchScores() {
            try {
                let user = JSON.parse(localStorage.getItem("user"));
                let token = this.$store.state.auth_token || user?.token;
                let userId = this.$store.state.user_id || user?.user_id;
        
                if (!token || !userId) throw new Error("No authentication token found");
        
                const res = await fetch(`${location.origin}/api/scores/${userId}`, {
                    headers: { 'Authentication-Token': token }
                });
        
                if (!res.ok) throw new Error(`Failed to fetch scores: ${res.status} ${res.statusText}`);
        
                let scoresData = await res.json();
                console.log(" Scores API Response:", scoresData); 
        
                this.scores = scoresData; 
        
                this.$nextTick(() => {
                    console.log(" Final Scores in nextTick:", this.scores);
                });
            } catch (error) {
                console.error("Error fetching scores:", error);
                alert(error.message);
            }
        }
        
        ,

        
        async fetchSubjects() {
            try {
                let user = JSON.parse(localStorage.getItem("user"));
                let token = this.$store.state.auth_token || user?.token;

                if (!token) throw new Error("No authentication token found");

                const res = await fetch(`${location.origin}/api/subjects`, {
                    headers: { 
                        'Authentication-Token': token,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) throw new Error(`Failed to fetch subjects: ${res.status} ${res.statusText}`);

                this.subjects = await res.json();
                console.log("Subjects fetched successfully:", this.subjects);
            } catch (error) {
                console.error("Error fetching subjects:", error);
                alert(error.message);
            }
        },

        
        async fetchChapters() {
            try {
                let user = JSON.parse(localStorage.getItem("user"));
                let token = this.$store.state.auth_token || user?.token;

                if (!token) throw new Error("No authentication token found");
                if (this.subjects.length === 0) return; 

                const res = await fetch(`${location.origin}/api/subjects/${this.subjects[0]?.id}/chapters`, {
                    headers: { 'Authentication-Token': token }
                });

                if (!res.ok) throw new Error(`Failed to fetch chapters: ${res.status} ${res.statusText}`);

                this.chapters = await res.json();
                console.log("Chapters fetched successfully:", this.chapters);
            } catch (error) {
                console.error("Error fetching chapters:", error);
                alert(error.message);
            }
        },

        
        selectChapter(id) {
            this.$router.push(`/subjects/${id}/chapters/select`);
        },
        
                
               
    },

    
    async mounted() {
        await this.fetchScores();  
        await this.fetchSubjects();
    
        if (this.subjects.length > 0) {  
            await this.fetchChapters();
        }
    
        this.$nextTick(() => {
            console.log(" Final Scores after mounting:", this.scores);
        });
    }
    
    
};
