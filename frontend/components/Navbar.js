export default {
  template: `
  <div class="container-fluid">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg p-3">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to='/'>Quiz Master</router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
 
          <li class="nav-item">
              <router-link class="nav-link" to='/'>Home</router-link>
            </li>

            <li v-if="!$store.state.loggedIn" class="nav-item">
              <router-link class="nav-link" to='/login'>Login</router-link>
            </li>

            <li v-if="!$store.state.loggedIn" class="nav-item">
              <router-link class="nav-link" to='/register'>Register</router-link>
            </li>

            <li v-if="$store.state.loggedIn && $store.state.role == 'admin'" class="nav-item">
              <router-link class="nav-link" to='/admin-dashboard'>Admin Dashboard</router-link>
            </li>

            <li v-if="$store.state.loggedIn && $store.state.role == 'user'" class="nav-item">
              <router-link class="nav-link" to='/user-dashboard'>User Dashboard</router-link>
            </li>

            
            <li v-if="$store.state.loggedIn" class="nav-item">
              <router-link class="nav-link" to='/summary'>Summary</router-link>
            </li>

            <li v-if="$store.state.loggedIn" class="nav-item">
              <button class="btn btn-secondary" @click="handleLogout">Logout</button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  </div>
  `,
 
  methods: {
    handleLogout() {
      this.$store.commit("logout");
      this.$router.push("/");
    }
  }
};
