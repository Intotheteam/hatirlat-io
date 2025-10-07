from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    CreateGroupView, join_group, ListGroupsView, DeleteGroupView, admin_add_user_to_group, GroupMembersView,
    GroupMemberDetailView,ReminderViewSet
)

router = DefaultRouter()
router.register(r'reminders', ReminderViewSet, basename='reminder')


urlpatterns = [
    path('groups/', ListGroupsView.as_view(), name='list-groups'),
    path('groups/create/', CreateGroupView.as_view(), name='create-group'),
    path('groups/<int:pk>/', DeleteGroupView.as_view(), name='delete-group'),
    path('groups/join/<str:join_code>/', join_group, name='join-group'),
    path('groups/<str:join_code>/members/', GroupMembersView.as_view(), name='group-members'),
    path('groups/<str:join_code>/members/<int:member_id>/', GroupMemberDetailView.as_view(), name='group-member-detail'),


    
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    
    path('join/<str:join_code>/', join_group, name='join_group'),
    path('admin/join/<str:join_code>/', admin_add_user_to_group, name='admin_add_user_to_group'),
]


urlpatterns += router.urls