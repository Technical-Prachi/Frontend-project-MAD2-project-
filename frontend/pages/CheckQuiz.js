export default {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Available quizzes</h2>
            <h2 class="text-center">Subject Name : {{subject.name}}</h2>
            <h2 class="text-center">Chapter Name : {{chapter.name}}</h2>
            <table class="table table-bordered">
                <thead class="thead-dark">
                    <tr>
                        <th>Quiz ID</th>
                        <th>Subject ID</th>
                        <th>Chapter ID</th> 
                        <th>Quiz Title</th>
                        <th>Number of Questions</th>
                        <th>Date of Quiz</th>
                        <th>Time Duration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="quiz in quizzes" :key="quiz.id">
                        <td>{{ quiz.id }}</td>
                        <td>{{ quiz.subject_id }}</td>
                        <td>{{ quiz.chapter_id }}</td>
                        <td>{{ quiz.quiz_title }}</td>
                        <td>{{ quiz.number_of_questions }}</td>
                        <td>{{ quiz.date_of_quiz }}</td>
                        <td>{{ quiz.time_duration }}</td>
                        <td>
                            <button @click="editQuiz(quiz.id)" class="btn btn-warning">Edit</button>
                            <button @click="deleteQuiz(quiz.id)" class="btn btn-danger ml-2">Delete</button>
                            <button @click="checkQuestion(quiz.id)" class="btn btn-primary ml-2">Check Question</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
                <button @click="goBack" class="btn btn-primary" style="font-size: 1.2rem; padding: 8px 16px; margin-right: 10px;">Back to Chapters</button>
                <button @click="addQuiz" class="btn btn-success ml-2" style="font-size: 1.2rem; padding: 8px 16px;">Add Quizzes +</button>
            </div>
        </div>
    `,
    data() {
        return {
            subjectId: this.$route.params.subjectId,
            chapterId: this.$route.params.chapterId,
            quizzes: [], // Holds quiz data
            subject: {},
            chapter:{} // ✅ Add subject object to avoid "undefined" error
        };
    },
    methods: {
        async fetchChapter() {
            try {
                const res = await fetch(`${location.origin}/api/chapters/${this.chapterId}`, {
 
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch chapter");
                this.chapter = await res.json();  // ✅ Fetch and store specific chapter
                console.log("Fetched Chapter:", this.chapter); // Debugging
            } catch (error) {
                console.error("Error fetching chapter:", error);
                alert("Error fetching chapter. Please try again.");
            }
        },
        
        async fetchSubject() {
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch subject");
                this.subject = await res.json(); // ✅ Fetch subject data
            } catch (error) {
                console.error("Error fetching subject:", error);
                alert("Error fetching subject. Please try again.");
            }
        },
        async fetchQuizzes() {
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch quizzes");
                this.quizzes = await res.json();
            } catch (error) {
                console.error("Error fetching quizzes:", error);
                alert("Error fetching quizzes. Please try again.");
            }
        },
        async deleteQuiz(quizId) {
            if (confirm("Are you sure you want to delete this quiz?")) {
                try {
                    const res = await fetch(`${location.origin}/api/quizzes/${quizId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authentication-Token': this.$store.state.auth_token
                        }
                    });
                    if (!res.ok) throw new Error("Failed to delete quiz");
                    this.fetchQuizzes();
                } catch (error) {
                    console.error("Error deleting quiz:", error);
                    alert("Error deleting quiz. Please try again.");
                }
            }
        },
        editQuiz(quizId) {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${quizId}/edit`);
        },
        checkQuestion(quizId) {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${quizId}/questions`);
        },
        addQuiz() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/add`);
        },
        goBack() {
            this.$router.push(`/subjects/${this.subjectId}/chapters`);
        }
    },
    mounted() {
        this.fetchSubject();
        this.fetchChapter(); 
        this.fetchQuizzes();
    }
    
};
