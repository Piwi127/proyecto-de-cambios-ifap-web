from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0003_alter_user_is_instructor_alter_user_is_student'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "DROP TABLE IF EXISTS chat_messageread;"
                "DROP TABLE IF EXISTS chat_chatnotification;"
                "DROP TABLE IF EXISTS chat_message;"
                "DROP TABLE IF EXISTS chat_chatroom_participants;"
                "DROP TABLE IF EXISTS chat_userchatstatus;"
                "DROP TABLE IF EXISTS chat_chatroom;"
            ),
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
