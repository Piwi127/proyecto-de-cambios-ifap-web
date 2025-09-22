# Generated manually for CourseAuditLog model

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseAuditLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('create', 'Creación'), ('update', 'Actualización'), ('activate', 'Activación'), ('deactivate', 'Desactivación'), ('transfer', 'Transferencia'), ('delete', 'Eliminación'), ('bulk_activate', 'Activación Masiva'), ('bulk_deactivate', 'Desactivación Masiva'), ('bulk_delete', 'Eliminación Masiva')], max_length=20)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('old_values', models.JSONField(blank=True, help_text='Valores anteriores (para actualizaciones)', null=True)),
                ('new_values', models.JSONField(blank=True, help_text='Nuevos valores (para actualizaciones)', null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('additional_data', models.JSONField(blank=True, help_text='Datos adicionales específicos de la acción', null=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='audit_logs', to='courses.course')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='course_audit_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Log de Auditoría de Curso',
                'verbose_name_plural': 'Logs de Auditoría de Cursos',
                'ordering': ['-timestamp'],
            },
        ),
    ]