# Generated by Django 2.1.4 on 2019-01-04 05:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('proposal', '0002_userproposalactivity'),
    ]

    operations = [
        migrations.AddField(
            model_name='proposal',
            name='previous',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='proposal.Proposal'),
        ),
    ]
