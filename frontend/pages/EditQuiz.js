export default {
    template: `
    <div class="container my-5">
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Edit Quiz</h2>
        <form @submit.prevent="updateQuiz">
            <div class="form-group">
                <label for="id">Quiz ID</label>
                <input type="text" class="form-control" id="id" v-model="quiz.id" readonly>
            </div>
            <div class="form-group">
                <label for="title">Quiz Title</label>
                <input type="text" class="form-control" id="quiz_title" v-model="quiz.quiz_title" required>
            </div>
            <div class="form-group">
                <label for="number_of_questions">Number of Questions</label>
                <input type="number" class="form-control" id="number_of_questions" v-model="quiz.number_of_questions" required>
            </div>
            <div class="form-group">
                <label for="quiz-date">Date and Time of Quiz</label> 
                <input type="datetime-local" class="form-control" id="quiz-date"
                       v-model="quiz.date_of_quiz" required>
            </div>
            <div class="form-group">
                <label for="time_duration">Time Duration (HH:MM)</label>
                <input type="text" class="form-control" id="time_duration" v-model="formattedTimeDuration" required>
            </div>
            <div class="form-group text-center">
                <button type="submit" class="btn btn-success">Save Changes</button>
                <button @click="goBack" type="button" class="btn btn-primary">Cancel</button>
            </div>
        </form>
    </div>
    `, 
    data() {
        return {
            subjectId: this.$route.params.subjectId,  
            chapterId: this.$route.params.chapterId,
            quiz: {
                id: '',
                quiz_title: '',
                number_of_questions: '',
                date_of_quiz: '',
                time_duration: 0  // Store as minutes
            }
        };
    },
    computed: {
        formattedTimeDuration: {
            get() {
                if (!this.quiz.time_duration) return "00:00";
                const hours = Math.floor(this.quiz.time_duration / 60);
                const minutes = this.quiz.time_duration % 60;
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            },
            set(value) {
                if (!value) {
                    this.quiz.time_duration = 0;
                    return;
                }
                const [hours, minutes] = value.split(":").map(Number);
                this.quiz.time_duration = (hours * 60) + minutes;
            }
        }
    },
    methods: {
        async fetchQuiz() {
            const quizId = this.$route.params.quizId;
            try {
                const authToken = this.$store.state.auth_token || localStorage.getItem("auth_token");
                const res = await fetch(`${location.origin}/api/quizzes/${quizId}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });
        
                if (res.ok) {
                    let quizData = await res.json();
        
                    if (quizData.date_of_quiz) {
                        let localDate = new Date(quizData.date_of_quiz);
                        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
                        quizData.date_of_quiz = localDate.toISOString().slice(0, 16);
                    }

                    this.quiz = { ...quizData };
                } else {
                    alert("Quiz not found!");
                    this.$router.push("/admin-dashboard");
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
                alert("Error fetching quiz!");
            }
        },

        async updateQuiz() {
            try {
                let localDate = new Date(this.quiz.date_of_quiz);
localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());

let updatedQuiz = {
    quiz_title: this.quiz.quiz_title,   
    number_of_questions: this.quiz.number_of_questions,
    date_of_quiz: localDate.toISOString().split('.')[0],  // ✅ Removes milliseconds & "Z"
    time_duration: this.quiz.time_duration
};

        
                const res = await fetch(`${location.origin}/api/quizzes/${this.quiz.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify(updatedQuiz)
                });

                const textResponse = await res.text();
                console.log("Raw API Response:", textResponse);

                if (!res.ok) {
                    try {
                        const errorData = JSON.parse(textResponse);
                        console.error("API Error Response:", errorData);
                        throw new Error(errorData.message || "Failed to update quiz");
                    } catch (e) {
                        throw new Error(`Unexpected response from server: ${textResponse}`);
                    }
                }

                alert("Quiz updated successfully!");
                this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`);

            } catch (error) {
                console.error("Error updating quiz:", error);
                alert(error.message);
            }
        },

        goBack() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`);
        }
    },
    mounted() {
        this.fetchQuiz();
    }
};
