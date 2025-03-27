export default {
    template: `
    <div class="container my-5">
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Edit Question</h2>
        <form @submit.prevent="updateQuestion">
            <div class="form-group">
                <label for="id">Question ID</label>
                <input type="text" class="form-control" id="id" v-model="question.id" readonly>
            </div>
            <div class="form-group">
                <label for="question_statement">Question Statement</label>
                <textarea class="form-control" id="question_statement" v-model="question.question_statement" rows="2" placeholder="Enter question" required></textarea>
            </div>
            <div class="form-group">
                <label for="option1">Option 1</label>
                <input type="text" class="form-control" id="option1" v-model="question.option1" required/>
            </div>
            <div class="form-group">
                <label for="option2">Option 2</label>
                <input type="text" class="form-control" id="option2" v-model="question.option2"  />
            </div>
            <div class="form-group">
                <label for="option3">Option 3</label>
                <input type="text" class="form-control" id="option3" v-model="question.option3"  />
            </div>
            <div class="form-group"> 
                <label for="option4">Option 4</label>
                <input type="text" class="form-control" id="option4" v-model="question.option4"  />
            </div>
            <div class="form-group">
                <label for="correct_option">Correct Answer</label>
                <input type="text" class="form-control" id="correct_option" v-model="question.correct_option" required />
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
        question: { id: '', question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: '' }
      };
    },
    methods: {
      async fetchQuestion() {
        const questionId = this.$route?.params?.questionId;
        if (!questionId) {
          console.error("Question ID not found");
          this.$router.push("/admin-dashboard");
          return;
        }
  
        console.log("Fetching Question ID:", questionId); // Debugging Log
  
        try {
          const res = await fetch(`${location.origin}/api/questions/${questionId}`, {
            headers: { 'Authentication-Token': this.$store.state.auth_token }
          });
  
          if (!res.ok) throw new Error("Failed to fetch question");
  
          this.question = await res.json();
        } catch (error) {
          console.error("Fetch Question Error:", error);
          alert(error.message);
          this.$router.push("/admin-dashboard");
        }
      },
      async updateQuestion() {
        const questionId = this.$route?.params?.questionId;
        if (!questionId) {
          console.error("Question ID not found");
          return;
        }
      
        try {
          const res = await fetch(`${location.origin}/api/questions/${questionId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token
            },
            body: JSON.stringify(this.question)
          });
      
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to update question");
          }
      
          alert("Question updated successfully!");
          this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters/${this.$route.params.chapterId}/quizzes/${this.$route.params.quizId}/questions`);

        } catch (error) {
          console.error("Update Question Error:", error);
          alert(error.message);
        }
      }
      ,
      goBack() {
        this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters/${this.$route.params.chapterId}/quizzes/${this.$route.params.quizId}/questions`);

      }
    },
    mounted() {
      this.fetchQuestion();
    }
  };
  