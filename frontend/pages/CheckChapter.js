export default {
    template: `
      <div class="container my-5">
        <h2 class="text-center mb-4 p-3 mb-2 bg-primary text-white">Chapters</h2>
        <h2 class="text-center">Subject Name : {{subject.name}}</h2>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Chapter ID</th>
              <th>Subject ID</th>
              <th>Chapter Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chapter in chapters" :key="chapter.id">
              <td>{{ chapter.id }}</td>
              <td>{{ chapter.subject_id }}</td>
              <td>{{ chapter.name }}</td>
              <td>{{ chapter.description }}</td>
              <td>
                <button @click="editChapter(chapter.id)" class="btn btn-warning">Edit</button>
                <button @click="deleteChapter(chapter.id)" class="btn btn-danger ml-2">Delete</button>
                <button @click="checkQuiz(chapter.id)" class="btn btn-primary ml-2">Check Quizzes</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
           <button @click="addChapter" class="btn btn-success" style="font-size: 1.2rem; padding: 8px 16px; margin-right: 10px;">Add Chapter +</button>
           <button @click="goBack" class="btn btn-secondary" style="font-size: 1.2rem; padding: 8px 16px;">Go Back</button>
        </div>

      </div>
    `,
    data() {
      return {
        subjectId: this.$route.params.subjectId,
        chapters: [],
        subject:{}
      };
    },
    methods: {
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
      async fetchChapters() {
        try {
          const res = await fetch(`${location.origin}/api/subjects/${this.$route.params.subjectId}/chapters`, {
            headers: {
              'Authentication-Token': this.$store.state.auth_token
            }
          });
          if (!res.ok) throw new Error("Failed to fetch chapters");
          const data = await res.json();
          this.chapters = data;
        } catch (error) {
          console.error("Error fetching chapters:", error);
          alert("Error fetching chapters. Please try again.");
        }
      },
      async deleteChapter(chapterId) {
        if (confirm("Are you sure you want to delete this chapter?")) {
          try {
            const res = await fetch(`${location.origin}/api/chapters/${chapterId}`, {
              method: 'DELETE',
              headers: {
                'Authentication-Token': this.$store.state.auth_token
              }
            });
            if (!res.ok) throw new Error("Failed to delete chapter");
            alert("Chapter deleted successfully!");
            this.fetchChapters();
          } catch (error) {
            console.error("Error deleting chapter:", error);
            alert("Error deleting chapter. Please try again.");
          }
        }
      },
      editChapter(chapterId) {
        this.$router.push(`/subjects/${this.subjectId}/chapters/${chapterId}/edit`);
      },
      checkQuiz(chapterId) {
        this.$router.push(`/subjects/${this.subjectId}/chapters/${chapterId}/quizzes`);
      },
      addChapter() {
        this.$router.push(`/subjects/${this.subjectId}/chapters/add`);
      },
      goBack() {
        this.$router.push("/admin-dashboard");
      }
    },
    mounted() {
      this.fetchChapters();
      this.fetchSubject();
    }
  };
  