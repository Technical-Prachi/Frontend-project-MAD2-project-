export default {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Add Question</h2>
            <form @submit.prevent="addQuestion">
                <div class="form-group">
                    <label for="question">Question Statement</label>
                    <textarea class="form-control" id="question" v-model="question.question_statement" rows="2" placeholder="Enter question" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="option1">Option 1</label>
                    <textarea class="form-control" id="option1" v-model="question.option1" rows="1" placeholder="Enter option 1" required></textarea>
                </div>
                <div class="form-group">
                    <label for="option2">Option 2</label>
                    <textarea class="form-control" id="option2" v-model="question.option2" rows="1" placeholder="Enter option 2" ></textarea>
                </div>
                <div class="form-group">
                    <label for="option3">Option 3</label>
                    <textarea class="form-control" id="option3" v-model="question.option3" rows="1" placeholder="Enter option 3" ></textarea>
                </div>
                <div class="form-group">
                    <label for="option4">Option 4</label>
                    <textarea class="form-control" id="option4" v-model="question.option4" rows="1" placeholder="Enter option 4" ></textarea>
                </div>

                <div class="form-group">
                    <label for="correct_answer">Correct Answer</label>
                    <input type="text" class="form-control" id="correct_answer" v-model="question.correct_option" placeholder="Enter correct answer" required>
                </div>

                <div class="form-group text-center">
                    <button type="submit" class="btn btn-success">Add Question</button>
                    <button @click="goBack" type="button" class="btn btn-primary">Cancel</button>
                </div>
            </form>
        </div>
    `,

    data() {
        return {
            subjectId: this.$route.params.subjectId,
            chapterId: this.$route.params.chapterId,
            quizId: this.$route.params.quizId,
            question: {
                question_statement: "",
                option1: "",
                option2: "",
                option3: "",
                option4: "",
                correct_option: ""
            }
        };
    },
    
    methods: {
        async addQuestion() { 
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    },
                    body: JSON.stringify(this.question)
                });
        
                // Log raw response
                const textResponse = await res.text();
                console.log("Raw API Response:", textResponse);
        
                // Check if response is JSON before parsing
                try {
                    const jsonResponse = JSON.parse(textResponse);
                    if (!res.ok) {
                        throw new Error(jsonResponse.response?.errors?.join(", ") || "Failed to add question");
                    }
                    alert("Question added successfully!");
                    this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`);
                } catch (jsonError) {
                    console.error("Failed to parse JSON:", jsonError);
                    throw new Error("Invalid JSON response from server.");
                }
            } catch (error) {
                console.error("Error adding question:", error);
                alert(error.message);
            }
        },
        
        
        goBack() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`);
        }
    }
};
