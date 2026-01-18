from django.contrib import admin

from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'reminder_date', 'priority', 'status', 'created_at')
    list_filter = ('priority', 'status', 'reminder_date')
    search_fields = ('title', 'description', 'user__username', 'user__email')
