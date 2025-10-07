from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser

import random

from .models import Customer, ReminderGroup, GroupMembership, Reminder
from .serializers import CustomerSerializer, ReminderGroupSerializer, ReminderSerializer


class CreateGroupView(generics.CreateAPIView):
    queryset = ReminderGroup.objects.all()
    serializer_class = ReminderGroupSerializer

    def perform_create(self, serializer):
        import string
        join_code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        serializer.save(join_code=join_code)


class ListGroupsView(APIView):
    def get(self, request):
        groups = ReminderGroup.objects.all().order_by('-created_at')
        serializer = ReminderGroupSerializer(groups, many=True)
        return Response(serializer.data)


class DeleteGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            group = ReminderGroup.objects.get(pk=pk)
            group.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ReminderGroup.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


from .serializers import GroupMembershipSerializer

class GroupMembersView(APIView):
    def get(self, request, join_code):
        try:
            group = ReminderGroup.objects.get(join_code=join_code)
        except ReminderGroup.DoesNotExist:
            return Response({"detail": "Grup bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        memberships = GroupMembership.objects.filter(group=group, is_active=True)
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)



class GroupMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_group_and_member(self, join_code, member_id):
        try:
            group = ReminderGroup.objects.get(join_code=join_code)
        except ReminderGroup.DoesNotExist:
            return None, None, Response({"detail": "Grup bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        try:
            membership = GroupMembership.objects.get(id=member_id, group=group)
        except GroupMembership.DoesNotExist:
            return group, None, Response({"detail": "Üye bulunamadı"}, status=status.HTTP_404_NOT_FOUND)

        return group, membership, None

    def delete(self, request, join_code, member_id):
        group, membership, error_response = self.get_group_and_member(join_code, member_id)
        if error_response:
            return error_response

        membership.delete()
        return Response({"detail": "Üye silindi"}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, join_code, member_id):
        group, membership, error_response = self.get_group_and_member(join_code, member_id)
        if error_response:
            return error_response

        if membership.status == "Pending":
            membership.status = "Active"
            membership.save()
            return Response({"detail": "Üye durumu Active yapıldı"})
        else:
            return Response({"detail": "Üye zaten aktif"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def join_group(request, join_code):
    try:
        group = ReminderGroup.objects.get(join_code=join_code)
    except ReminderGroup.DoesNotExist:
        return Response({'error': 'Geçersiz bağlantı'}, status=404)

    customer_data = request.data
    serializer = CustomerSerializer(data=customer_data)

    if serializer.is_valid():
        customer, created = Customer.objects.get_or_create(
            phone_number=serializer.validated_data['phone_number'],
            defaults=serializer.validated_data
        )

        if GroupMembership.objects.filter(customer=customer, group=group).exists():
            return Response({'message': 'Zaten bu gruba kayıtlısınız.'})

        GroupMembership.objects.create(customer=customer, group=group)
        return Response({'message': 'Kayıt başarılı'})

    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_add_user_to_group(request):
    customer_id = request.data.get('customer_id')
    group_id = request.data.get('group_id')

    if not customer_id or not group_id:
        return Response({"detail": "customer_id ve group_id gerekli."}, status=400)

    try:
        customer = Customer.objects.get(id=customer_id)
        group = ReminderGroup.objects.get(id=group_id)
    except Customer.DoesNotExist:
        return Response({"detail": "Customer bulunamadı."}, status=404)
    except ReminderGroup.DoesNotExist:
        return Response({"detail": "Grup bulunamadı."}, status=404)

    membership, created = GroupMembership.objects.get_or_create(customer=customer, group=group)
    if created:
        return Response({"detail": "Kullanıcı gruba eklendi."})
    else:
        return Response({"detail": "Kullanıcı zaten grupta."})


class ReminderCreateView(generics.CreateAPIView):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

    def perform_create(self, serializer):
        data = serializer.validated_data
        reminder_type = data.get('reminder_type')

        if reminder_type == 'Personal':
            phone = data.get('contact_phone')
            email = data.get('contact_email')
            name = data.get('contact_name')
            surname = ""

            customer = None
            if phone or email:
             customer, created = Customer.objects.get_or_create(
                    phone_number=phone if phone else '',
                    defaults={'name': name or 'Unknown', 'surname': surname, 'email': email}
                )
            else:
              import random
              random_phone = f"555{random.randint(1000000, 9999999)}"
              customer = Customer.objects.create(
                  name=name or "Unknown",
                 surname=surname,
                 phone_number=random_phone,
                  email=email or ""
              )
            serializer.save(customer=customer)

        elif reminder_type == 'Group':
            group = data.get('group')
            serializer.save(group=group)

        else:
            serializer.save()




class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all().select_related('group')
    serializer_class = ReminderSerializer

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        reminder = self.get_object()
        reminder.is_active = not reminder.is_active
        reminder.save()
        return Response({'id': reminder.id, 'is_active': reminder.is_active})


