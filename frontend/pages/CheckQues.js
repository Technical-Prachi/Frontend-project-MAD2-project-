export default {
    template: `
        <div class="container my-5">
            <h4 class="text-center p-3 mb-2 bg-primary text-white">Manage Questions</h4>
            <h4 class="text-center mb-4">Subject: {{ subject.name }}</h4>
            <h4 class="text-center mb-4">Chapter: {{ chapter.name }}</h4>
            <h4 class="text-center mb-4">Quiz: {{ quiz.quiz_title }}</h4>

            <table class="table table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>Subject ID</th>
                        <th>Chapter ID</th>
                        <th>Quiz ID</th>
                        <th>Ques ID</th>

                        <th>Question Statement</th>
                        <th>Option 1</th>
                        <th>Option 2</th>
                        <th>Option 3</th> 
                        <th>Option 4</th>
                        <th>Correct Option</th>
                        <th>Actions</th>
                    </tr>
                </thead> 
                <tbody>
                    <tr v-for="ques in questions" :key="ques.id">
                        <td>{{ ques.subject_id }}</td>
                        <td>{{ ques.chapter_id }}</td>
                        <td>{{ ques.quiz_id }}</td>
                        <td>{{ ques.id }}</td>

                        <td>{{ ques.question_statement }}</td>
                        <td>{{ ques.option1 }}</td>
                        <td>{{ ques.option2 }}</td>
                        <td>{{ ques.option3 }}</td>
                        <td>{{ ques.option4 }}</td>
                        <td>{{ ques.correct_option }}</td>
                        <td>
                            <button @click="editQues(ques.id)" class="btn btn-sm btn-primary">Edit</button>
                            <button @click="deleteQues(ques.id)" class="btn btn-sm btn-danger">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="text-center mt-4">
                <button @click="goBack" class="btn btn-primary">Back to Quiz</button>
                <button @click="addQuestion" class="btn btn-success ml-2">Add Questions +</button>
            </div>
        </div>
    `,
    data() {
        return {
            subjectId: this.$route.params.subjectId,
            chapterId: this.$route.params.chapterId,
            quizId: this.$route.params.quizId,
            questions: [],  // ✅ Fixed missing comma
            subject: {},
            chapter: {},
            quiz: {}
        };
    },
    methods: {
        async fetchSubject() {
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.subject = data;
                } else {
                    alert("Failed to fetch subject!");
                    this.$router.push("/admin-dashboard");
                }
            } catch (error) {
                console.error("Error fetching subject:", error);
                alert("Error fetching subject!");
            }
        },

        async fetchChapter() {
            try {
                const res = await fetch(`${location.origin}/api/chapters/${this.chapterId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.chapter = data;
                } else {
                    alert("Failed to fetch chapter!");
                    this.$router.push("/admin-dashboard");
                }
            } catch (error) {
                console.error("Error fetching chapter:", error);
                alert("Error fetching chapter!");   
            }
        },

        async fetchQuiz() {
            try {
                const res = await fetch(`${location.origin}/api/quizzes/${this.quizId}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.quiz = data;
                } else {
                    alert("Failed to fetch quiz!");
                    this.$router.push("/admin-dashboard");
                }
            } catch (error) {  // ✅ Moved catch outside try block
                console.error("Error fetching quiz:", error);
                alert("Error fetching quiz!");
            }
        },
        
        async fetchQuestions() {
            try {
                const res = await fetch(`${location.origin}/api/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error("Failed to fetch questions");

                this.questions = await res.json();
            } catch (error) {
                console.error("Error fetching questions:", error);
                alert("Error fetching questions!");
            }
        },

        async deleteQues(questionId) {  // ✅ Fixed function definition
            if (confirm("Are you sure you want to delete this question?")) {
                try {
                    const res = await fetch(`${location.origin}/api/questions/${questionId}`, {  // ✅ Corrected API URL
                        method: 'DELETE',
                        headers: { 'Authentication-Token': this.$store.state.auth_token }
                    });

                    if (res.ok) {
                        alert("Question deleted successfully!");
                        this.fetchQuestions(); // Refresh the list
                    } else {
                        alert("Failed to delete question!");
                    }
                } catch (error) {
                    console.error("Error deleting question:", error);
                    alert("Error deleting question!");
                }
            }
        },

        editQues(questionId) {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions/${questionId}/edit`);
        },

        addQuestion() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes/${this.quizId}/questions/add`);
        },

        goBack() {
            this.$router.push(`/subjects/${this.subjectId}/chapters/${this.chapterId}/quizzes`);
        }
    },

    mounted() {
        this.fetchSubject();
        this.fetchChapter();
        this.fetchQuiz();
        this.fetchQuestions();
    }
};
