export default {
    template: `
    <div class="container my-5">
        <h4 class="text-center p-3 mb-2 bg-primary text-white">Available Chapters</h4>
        <h4 class="text-center mb-4">Subject: {{ subject.name || 'Loading...' }}</h4>

        <table v-if="chapters.length > 0" class="table table-hover">
            <thead class="thead-dark">
                <tr>
                    <th>Chapter ID</th>
                    <th>Subject ID</th>
                    <th>Chapter Name</th>
                    <th>Description</th>
                    <th>Quiz Title</th>
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
                        <span v-for="quiz in getQuizzesByChapter(subject.id, chapter.id)" :key="quiz.id">
                            • {{ quiz.quiz_title }}<br>
                        </span>
                    </td>
                    <td>
                        <button @click="selectQuiz(chapter.id)" class="btn btn-primary">
                            Select Quiz
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else class="text-center">No available chapters for this subject.</p>
    </div>
    `,

    data() {
        return {
            subject: {},
            subjects: [],
            chapters: [],
            quizzes: {}  // Nested quizzes object: { subjectId: { chapterId: [quizzes] } }
        };
    },

    methods: {
        async fetchChapters(subjectId) {
            try {
                if (!subjectId) throw new Error("Invalid subject ID");

                const res = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) throw new Error(res.statusText);
                this.chapters = await res.json();
            } catch (error) {
                console.error("Error fetching chapters:", error);
            }
        },

        async fetchQuizzes(subjectId, chapterId) {
            try {
                if (!subjectId || !chapterId) throw new Error("Invalid subject or chapter ID");

                const res = await fetch(`${location.origin}/api/subjects/${subjectId}/chapters/${chapterId}/quizzes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
                const quizzes = await res.json();

                // ✅ Vue Reactivity Fix: Nested structure ensure karna
                if (!this.quizzes[subjectId]) {
                    this.$set(this.quizzes, subjectId, {});
                }
                this.$set(this.quizzes[subjectId], chapterId, quizzes);

                console.log(`Fetched quizzes for Subject ${subjectId}, Chapter ${chapterId}:`, quizzes);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        },

        async fetchSubjects() {
            try {
                const res = await fetch(`${location.origin}/api/subjects`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (!res.ok) throw new Error(res.statusText);
                const subjects = await res.json();
                this.subject = subjects.find(s => s.id == this.$route.params.subjectId) || {};
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        },

        getQuizzesByChapter(subjectId, chapterId) {
            return this.quizzes[subjectId]?.[chapterId] || [];
        },

        selectQuiz(chapterId) {
            this.$router.push(`/subjects/${this.$route.params.subjectId}/chapters/${chapterId}/quizzes/select`);
        }
    },

    async mounted() {
        const subjectId = this.$route.params.subjectId;

        await this.fetchSubjects();
        await this.fetchChapters(subjectId);

        // ✅ ✅ ✅ Har chapter ke liye quizzes ko subjectId + chapterId ke basis pr fetch karna
        for (const chapter of this.chapters) {
            await this.fetchQuizzes(subjectId, chapter.id);
        }
    }
};
