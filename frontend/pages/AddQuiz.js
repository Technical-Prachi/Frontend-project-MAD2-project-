export default {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Add New Quiz</h2>
            <form @submit.prevent="addQuiz">
                <div class="form-group">
                    <label for="quiz-title">Quiz Title</label>
                    <input type="text" class="form-control" id="quiz-title" v-model="quiz.quiz_title" placeholder="Enter quiz title" required>
                </div> 
                <div class="form-group">
                    <label for="num-questions">Number of Questions</label>
                    <input type="number" class="form-control" id="num-questions" v-model="quiz.number_of_questions" placeholder="Enter number of questions" required>
                </div>
                <div class="form-group">
                    <label for="quiz-date">Date and Time of Quiz</label> 
                    <input type="datetime-local" class="form-control" id="quiz-date"
                          v-model="quiz.date_of_quiz" required>
                    
                </div>


                <div class="form-group">
                    <label for="time_duration">Time Duration (HH:MM)</label>
                    <input type="text" class="form-control" id="time_duration" v-model="quiz.time_duration" required>
                    <small class="form-text text-muted">Enter duration in HH:MM format (e.g., 01:30 for 90 minutes)</small>
                </div>

                <div class="form-group text-center">
                    <button type="submit" class="btn btn-success">Add Quiz</button>
                    <button @click="goBack" type="button" class="btn btn-primary">Cancel</button>
                </div>
            </form>
        </div>
    `,
    data() {
        return {
            subjectId: this.$route.params.subjectId,  // ✅ Fix: Use correct param keys
            chapterId: this.$route.params.chapterId,
            quiz: {
                quiz_title: '',
                number_of_questions: '',
                date_of_quiz: '',
                time_duration: '00:00',
            }
        };
    },
    methods: {
        async addQuiz() {
            try {
                let convertedTime = 0;
                if (this.quiz.time_duration) {
                    const [hours, minutes] = this.quiz.time_duration.split(":").map(Number);
                    convertedTime = (hours * 60) + minutes;
                }
        
                const quizData = {
                    ...this.quiz,
                    time_duration: convertedTime
                };
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify(quizData)
                });

                // ✅ Fix: Handle non-JSON responses
                const textResponse = await res.text(); // Get raw response first
                console.log("Raw API Response:", textResponse); // Debugging info

                if (!res.ok) {
                    try {
                        const errorData = JSON.parse(textResponse);
                        console.error("API Error Response:", errorData);
                        throw new Error(errorData.message || "Failed to add quiz");
                    } catch (e) {
                        throw new Error(`Unexpected response from server: ${textResponse}`);
                    }
                }

                alert("Quiz added successfully!");
                this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`);

            } catch (error) {
                console.error("Error adding quiz:", error);
                alert(error.message);
            }
        },
        goBack() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`);
        }
    }
};
