export default {
    template: `
        <div class="container mt-4">
            <h4 class="text-center p-3 mb-2 bg-primary text-white">Available Quizzes</h4>
            <h4 class="text-center mb-4">Subject: {{ subject.name }}</h4>
            <h4 class="text-center mb-4">Chapter: {{ chapter.name }}</h4>

            <table v-if="quizzes.length" class="table table-hover">
               <thead class="thead-dark">
                   <tr>
                       <th>Quiz ID</th>
                       <th>Quiz Title</th>
                       <th>No of Questions</th>
                       <th>Date of Quiz</th>
                       <th>Time Duration</th>
                       <th>Action</th>
                   </tr>
               </thead>
               <tbody>
                   <tr v-for="quiz in quizzes" :key="quiz.id">
                       <td>{{ quiz.id }}</td>
                       <td>{{ quiz.quiz_title }}</td>
                       <td>{{ quiz.number_of_questions }}</td>
                       <td>{{ formatDate(quiz.date_of_quiz) }}</td>
                       <td>{{ quiz.time_duration }}</td>
                       <td>
                           <button 
                               @click="startQuiz(quiz.id)" 
                               class="btn btn-primary"
                               :disabled="!isQuizAvailable(quiz.date_of_quiz)"
                           >
                               Start Quiz
                           </button>
                       </td>
                   </tr>
               </tbody>
            </table>
            <p v-else class="text-center">No quizzes available for this chapter.</p>
        </div>
    `,

    data() {
        return {
            subject: {},
            chapter: {},
            quizzes: []
        };
    },

    methods: {
        async fetchSubject(subjectId) {
            try {
                if (!subjectId) throw new Error("Invalid subject ID");

                const res = await fetch(`${location.origin}/api/subjects/${subjectId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error(`Failed to fetch subject details: ${res.status} ${res.statusText}`);

                this.subject = await res.json();
            } catch (error) {
                console.error("Error fetching subject:", error);
                alert(error.message);
            }
        },

        async fetchChapter(subjectId, chapterId) {
            try {
                if (!subjectId || !chapterId) throw new Error("Invalid subject or chapter ID");

                const res = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error(`Failed to fetch chapter: ${res.status} ${res.statusText}`);

                this.chapter = await res.json();
            } catch (error) {
                console.error("Error fetching chapter:", error);
                alert(error.message);
            }
        },

        async fetchQuizzes(subjectId, chapterId) {
            try {
                if (!subjectId || !chapterId) throw new Error("Invalid subject or chapter ID");

                const res = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters/${chapterId}/quizzes`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error(`Failed to fetch quizzes: ${res.status} ${res.statusText}`);

                const data = await res.json();

                this.quizzes = Array.isArray(data.quizzes) ? data.quizzes : Array.isArray(data) ? data : [data];

            } catch (error) {
                console.error("Error fetching quizzes:", error);
                alert(error.message);
                this.quizzes = [];
            }
        },

        startQuiz(quizId) { 
            if (!quizId) {
                alert("Invalid quiz ID");
                return;
            }
            this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters/${this.$route.params.chapterId}/quizzes/${quizId}/start`);
        },

        isQuizAvailable(quizDate) {
            if (!quizDate) return false;
            
            const quizDateTime = new Date(quizDate).getTime();
            const currentTime = new Date().getTime();

            return currentTime >= quizDateTime;
        },

        formatDate(dateString) {
            const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
            return new Date(dateString).toLocaleDateString("en-US", options);
        }
    },

    async mounted() {
        const subjectId = this.$route.params.subjectId;
        const chapterId = this.$route.params.chapterId;

        if (subjectId && chapterId) {
            await this.fetchSubject(subjectId);
            await this.fetchChapter(subjectId, chapterId);
            await this.fetchQuizzes(subjectId, chapterId);  
        }
    }
};
