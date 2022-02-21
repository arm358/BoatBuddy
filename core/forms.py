from django import forms
from .models import Marker

CHOICES = (
    ("Soundings", "Soundings"),
    ("Depth Areas", "Depth Areas"),
    ("Recommended Track", "Recommended Track"),
    ("Buoys", "Buoys"),
    ("Beacons", "Beacons"),
)


class UploadGeoJSONForm(forms.Form):
    geojsontype = forms.ChoiceField(choices=CHOICES)
    source = forms.CharField(max_length=10)
    geojsonchart = forms.CharField(max_length=50, required=False)
    geojsonfiles = forms.FileField(
        widget=forms.ClearableFileInput(attrs={"multiple": True})
    )


class UploadENCForm(forms.Form):
    source = forms.CharField(max_length=10)
    enctype = forms.MultipleChoiceField(choices=CHOICES, required=True)
    encfiles = forms.FileField(
        widget=forms.ClearableFileInput(attrs={"multiple": True})
    )

class MarkerForm(forms.ModelForm):
    class Meta:
        model = Marker
        fields = "__all__"
