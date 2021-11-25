<template>
  <div class="basic-layout">
    <div :class="['nav-side', isCollapse ? 'fold' : 'unfold']">
      <!-- 系统LOGO -->
      <div class="logo">
        <img src="./../assets/logo.png" />
        <span>Manager</span>
      </div>
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        background-color="#001529"
        text-color="#fff"
        router
        :collapse="isCollapse"
        class="nav-menu"
        v-loading="menuLoading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
  
          <TreeMenu :userMenu="userMenu" />

      </el-menu>
    </div>
    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <i class="el-icon-s-fold"></i>
          </div>
          <div class="bread">
            <BreadCrumb />
          </div>
        </div>
        <div class="user-info">
          <el-badge
            :is-dot="noticeCount > 0 ? true : false"
            class="notice"
            type="danger"
            @click="$router.push('/audit/approve')"
          >
            <i class="el-icon-bell"></i>
          </el-badge>
          <el-dropdown @command="handleLogout">
            <span class="user-link">
              {{ userInfo.userName }}
              <i class="el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="email"
                  >邮箱：{{ userInfo.userEmail }}</el-dropdown-item
                >
                <el-dropdown-item command="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import TreeMenu from "./TreeMenu.vue";
import BreadCrumb from "./BreadCrumb.vue";
export default {
  name: "Home",
  components: { TreeMenu, BreadCrumb },
  data() {
    return {
      isCollapse: false,
      userInfo: this.$store.state.userInfo,
      userMenu: [],
      activeMenu: location.hash.slice(1),
      menuLoading: false,
    };
  },
  computed: {
    noticeCount() {
      return this.$store.state.noticeCount;
    },
  },
  mounted() {
    this.getNoticeCount();
    this.getMenuList();
  },
  methods: {
    toggle() {
      this.isCollapse = !this.isCollapse;
    },
    handleLogout(key) {
      if (key == "email") return;
      this.$store.commit("saveUserInfo", "");
      this.userInfo = {};
      this.$router.replace("/login");
    },
    async getNoticeCount() {
      try {
        const count = await this.$api.noticeCount();
      } catch (error) {
        console.error(error);
      }
    },
    async getMenuList() {
      try {
        this.menuLoading = true;
        const {menuList,btnActionList} = await this.$api.getPermissionMenuList();
        setTimeout(() => {
          this.menuLoading = false;
        }, 500);
        this.userMenu = menuList;
        this.$store.commit('saveMenuList',menuList)
        this.$store.commit('saveActionList',btnActionList)
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style lang="scss">
.basic-layout {
  position: relative;
  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow: hidden;
    transition: width 0.5s;
    .logo {
      display: flex;
      align-items: center;
      font-size: 18px;
      height: 50px;
      img {
        margin: 0 16px;
        width: 32px;
        height: 32px;
      }
    }
    .nav-menu {
      height: calc(100vh - 50px);
      border-right: none;
    }
    // 合并
    &.fold {
      width: 64px;
    }
    // 展开
    &.unfold {
      width: 200px;
    }
  }
  .content-right {
    margin-left: 200px;
    transition: all .5s;
    // 合并
    &.fold {
      margin-left: 64px;
    }
    // 展开
    &.unfold {
      margin-left: 200px;
    }
    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      padding: 0 20px;
      .nav-left {
        display: flex;
        align-items: center;
        .bread {
          cursor: pointer;
        }
        .menu-fold {
          margin-right: 15px;
          font-size: 18px;
          cursor: pointer;
        }
      }
      .user-info {
        .notice {
          line-height: 30px;
          margin-right: 15px;
          cursor: pointer;
        }
        .user-link {
          cursor: pointer;
          color: #409eff;
        }
      }
    }
    .wrapper {
      background: #eef0f3;
      padding: 20px;
      height: calc(100vh - 50px);
      .main-page {
        background: #fff;
        height: 100%;
      }
    }
  }
}
</style>
